const { StatusCodes } = require('http-status-codes');
const Job = require('../models/Job');
const { NotFoundError, BadRequestError } = require('../errors');

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt');
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length });
};

const getJob = async (req, res) => {
  const userId = req.user.userId;
  const jobId = req.params.id;

  const singleJob = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });

  if (!singleJob) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ singleJob });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create({ ...req.body });
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.userId;
  const { company, position } = req.body;

  if (company === '' || position === '') {
    throw new BadRequestError('Company and Position field cannot empty');
  }

  const updatedJob = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    { ...req.body },
    { new: true, runValidators: true }
  );

  if (!updatedJob) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).json({ updatedJob });
};

const deleteJob = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.userId;

  const deletedJob = await Job.findOneAndDelete({
    _id: jobId,
    createdBy: userId,
  });

  if (!deletedJob) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }

  res.status(StatusCodes.OK).send();
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
};
