const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const BadRequestError = require('../errors/bad-request');
const UnauthenticatedError = require('../errors/unauthenticated');

const register = async (req, res) => {
  /* const { name, email, password } = req.body;

  const salt = bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const tempUser = { name, email, password: hashedPassword }; */
  //Using mongoose pre function

  const user = await User.create({ ...req.body });

  /* const token = jwt.sign({ userId: user._id, name: user.name }, 'jwt', {
    expiresIn: '30d',
  }); */
  //Using mongoose methods to create createJWT() inside model

  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new BadRequestError('Please provide email and password');

  const user = await User.findOne({ email });

  if (!user) throw new UnauthenticatedError('Invalid credentials');

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) throw new UnauthenticatedError('Invalid credentials');

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
};

module.exports = {
  register,
  login,
};
