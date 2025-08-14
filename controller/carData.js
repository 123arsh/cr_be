const path = require('path');
const data = require('../models/cardetails');

// Handle add car details
const addCarDetails = async (req, res) => {
  const { name, catagory, color, fuel, hp, torque, transmission, gears, drivetrain, discription } = req.body;

  try {
    const car = await data.create({
      name,
      catagory,
      color,
      fuel,
      hp,
      torque,
      transmission,
      gears,
      drivetrain,
      discription,
      image: `/carImages/${req.file.filename}`,
    });
    return res.status(200).json(car);
  } catch (error) {
    return res.status(500).send({
      message: 'Some unwanted thing happened here',
      error
    });
  }
};

// Handle car list fetching
const getCarList = async (req, res) => {
  try {
    const carsData = await data.find();
    const count = carsData.length;

    if (!carsData || count === 0) {
      return res.status(404).json({ message: 'No cars found.' });
    }

    return res.status(200).json({ carsData, count });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  addCarDetails,
  getCarList
};
