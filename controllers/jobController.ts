import { Request, Response } from 'express';
import Job from '../models/Job';
import JobApplication from '../models/JobApplication';

const JobModel: any = Job;
const JobApplicationModel: any = JobApplication;

// ============================================================
// PUBLIC CONTROLLERS
// ============================================================

/**
 * Get all published job openings (Public)
 */
export const getPublicJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, employmentType } = req.query;

    const filter: any = { status: 'Published' };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (employmentType && employmentType !== 'All') {
      filter.employmentType = employmentType;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [
        { title: regex },
        { category: regex },
        { location: regex },
        { skills: regex },
        { description: regex },
      ];
    }

    const jobs = await JobModel.find(filter).sort({ featured: -1, createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch jobs',
    });
  }
};

/**
 * Get single published job details (Public)
 */
export const getPublicJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await JobModel.findOne({ _id: id, status: 'Published' });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job opening not found or no longer active',
      });
      return;
    }

    res.json({
      success: true,
      job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch job details',
    });
  }
};

/**
 * Apply for a job (Public)
 */
export const applyForJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, resume, portfolioUrl, linkedInUrl, coverLetter } = req.body;

    // Check if job exists and is published
    const job = await JobModel.findOne({ _id: id, status: 'Published' });
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job opening not found or closed for applications',
      });
      return;
    }

    // Basic validation
    if (!fullName || !email || !phone || !resume) {
      res.status(400).json({
        success: false,
        message: 'Full Name, Email, Phone, and Resume are required',
      });
      return;
    }

    const application = await JobApplicationModel.create({
      job: id,
      fullName,
      email,
      phone,
      resume,
      portfolioUrl: portfolioUrl || '',
      linkedInUrl: linkedInUrl || '',
      coverLetter: coverLetter || '',
      status: 'Applied',
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit application',
    });
  }
};

// ============================================================
// ADMIN CONTROLLERS
// ============================================================

/**
 * Get all job openings for Admin (with filters)
 */
export const getAdminJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, status } = req.query;

    const filter: any = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [
        { title: regex },
        { category: regex },
        { location: regex },
        { skills: regex },
      ];
    }

    const jobs = await JobModel.find(filter).sort({ createdAt: -1 }).lean();

    // Attach application count to each job
    const jobIds = jobs.map((j: any) => j._id);
    const applicationCounts = await JobApplicationModel.aggregate([
      { $match: { job: { $in: jobIds } } },
      { $group: { _id: '$job', count: { $sum: 1 } } },
    ]);

    const countMap: Record<string, number> = {};
    applicationCounts.forEach((item: any) => {
      countMap[item._id.toString()] = item.count;
    });

    const jobsWithCounts = jobs.map((j: any) => ({
      ...j,
      applicantCount: countMap[j._id.toString()] || 0,
    }));

    res.json({
      success: true,
      jobs: jobsWithCounts,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin jobs',
    });
  }
};

/**
 * Create a new job opening (Admin)
 */
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      category,
      role,
      location,
      employmentType,
      experience,
      salary,
      description,
      responsibilities,
      requirements,
      skills,
      deadline,
      applicationEmail,
      featured,
      status,
    } = req.body;

    if (!title || !category || !location || !employmentType || !description) {
      res.status(400).json({
        success: false,
        message: 'Title, category, location, employment type, and description are required',
      });
      return;
    }

    const job = await JobModel.create({
      title,
      category,
      role: role || title,
      location,
      employmentType,
      experience: experience || 'Not Specified',
      salary: salary || '',
      description,
      responsibilities: responsibilities || '',
      requirements: requirements || '',
      skills: Array.isArray(skills) ? skills : [],
      deadline: deadline ? new Date(deadline) : undefined,
      applicationEmail: applicationEmail || '',
      featured: Boolean(featured),
      status: status || 'Draft',
    });

    res.status(201).json({
      success: true,
      message: 'Job opening created successfully',
      job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create job opening',
    });
  }
};

/**
 * Update an existing job opening (Admin)
 */
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!updateData.role && updateData.title) {
      updateData.role = updateData.title;
    }

    if (updateData.deadline) {
      updateData.deadline = new Date(updateData.deadline);
    }

    const job = await JobModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Job opening updated successfully',
      job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job opening',
    });
  }
};

/**
 * Toggle/patch job status (Admin)
 */
export const toggleJobStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Draft', 'Published', 'Closed'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Allowed values: Draft, Published, Closed',
      });
      return;
    }

    const job = await JobModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
      return;
    }

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      job,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job status',
    });
  }
};

/**
 * Delete a job opening and its applications (Admin)
 */
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await JobModel.findByIdAndDelete(id);
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job opening not found',
      });
      return;
    }

    // Delete related applications
    await JobApplicationModel.deleteMany({ job: id });

    res.json({
      success: true,
      message: 'Job opening and related applications deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete job opening',
    });
  }
};

/**
 * Get all job applications (Admin)
 */
export const getAdminApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, status, search } = req.query;
    const filter: any = {};

    if (jobId && jobId !== 'All') {
      filter.job = jobId;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      filter.$or = [
        { fullName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const applications = await JobApplicationModel.find(filter)
      .populate('job', 'title category location employmentType status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch job applications',
    });
  }
};

/**
 * Update application status (Admin)
 */
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
      return;
    }

    const application = await JobApplicationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('job', 'title category');

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update application status',
    });
  }
};

/**
 * Delete an application (Admin)
 */
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await JobApplicationModel.findByIdAndDelete(id);

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete application',
    });
  }
};

/**
 * Get Career Statistics (Admin)
 */
export const getCareerStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalJobs = await JobModel.countDocuments();
    const publishedJobs = await JobModel.countDocuments({ status: 'Published' });
    const totalApplications = await JobApplicationModel.countDocuments();
    const pendingApplications = await JobApplicationModel.countDocuments({ status: 'Applied' });
    const shortlistedApplications = await JobApplicationModel.countDocuments({ status: 'Shortlisted' });

    res.json({
      success: true,
      stats: {
        totalJobs,
        publishedJobs,
        totalApplications,
        pendingApplications,
        shortlistedApplications,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch career stats',
    });
  }
};
