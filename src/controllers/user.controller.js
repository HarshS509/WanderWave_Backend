import User from '../models/user.model.js';

export const getAllUserHandler = async (req, res) => {
  try {
    const users = await User.find().select('_id fullName role email');
    return res.status(200).json({ users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

export const changeUserRoleHandler = async (req, res) => {
  try {
    console.log('i got you', req.body.newRole);

    const userId = req.params.userId;
    const { role } = req.body;
    if (role === 'USER' || role === 'ADMIN') {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found!' });
      user.role = role;
      user.save();
    } else {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    return res.status(200).json({ message: 'User information has been successfully updated.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An internal server error occurred.', error: error });
  }
};

export const deleteUserHandler = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found!' });
    res.status(204).json({ message: 'User has been successfully deleted.' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'An internal server error occurred.', error: error });
  }
};
