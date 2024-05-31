const Car = require('../models/Car');
const { getIo } = require('../config/socket');
const geolib = require('geolib');

exports.addCar = async (req, res) => {
  const { name, model, licensePlate, location } = req.body;

  try {
    const car = new Car({
      name,
      model,
      licensePlate,
      owner: req.user._id,
      location
    });

    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCar = async (req, res) => {
  const { name, model, licensePlate, location } = req.body;

  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    car.name = name || car.name;
    car.model = model || car.model;
    car.licensePlate = licensePlate || car.licensePlate;
    car.location = location || car.location;

    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (car.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update car location
exports.updateCarLocation = async (req, res) => {
  try {
    const { carId } = req.params;
    const { latitude, longitude } = req.body;

    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car.location.coordinates = [longitude, latitude];
    car.locationHistory.push({
      type: 'Point',
      coordinates: [longitude, latitude],
    });
    await car.save();

    // Emit the updated location to all clients
    const io = getIo();
    io.emit('locationUpdate', {
      licensePlate: car.licensePlate,
      latitude,
      longitude,
    });

    res.json(car);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Track car location
exports.trackCar = async (req, res) => {
  const { licensePlate } = req.params;

  try {
    const car = await Car.findOne({ licensePlate });

    if (!car) {
      return res.status(404).json({ msg: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Add this method to carController.js
exports.updateCarLocationHistory  = async (req, res) => {
  const { id } = req.params;
  const { latitude, longitude } = req.body;

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ msg: 'Car not found' });
    }

    // Create a new location object
    const newLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // Push the new location into the locationHistory array
    car.locationHistory.push(newLocation);

    // Update the current location of the car
    car.location = newLocation;

    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// controllers/carController.js

exports.startRouteSimulation = async (req, res) => {
  const { id } = req.params;
  const { route, interval } = req.body;

  try {
    const car = await Car.findById(id);
    if (!car) {
      return res.status(404).json({ msg: 'Car not found' });
    }

    car.route = route;
    await car.save();

    // Simulate the car movement
    let index = 0;
    const simulateMovement = setInterval(async () => {
      if (index >= car.route.length) {
        clearInterval(simulateMovement);
        return;
      }

      car.location = {
        type: 'Point',
        coordinates: car.route[index],
      };

      car.locationHistory.push(car.location);
      await car.save();

      const io = require('../config/socket').getIo();
      io.emit('locationUpdate', {
        licensePlate: car.licensePlate,
        latitude: car.route[index][1],
        longitude: car.route[index][0],
      });

      index++;
    }, interval);

    res.json({ msg: 'Simulation started' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


// exports.getCarHistory = async (req, res) => {
//   try {
//     const car = await Car.findById(req.params.id);

//     if (!car) {
//       return res.status(404).json({ message: 'Car not found' });
//     }

//     res.json(car.locationHistory);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// exports.checkCarArea = async (req, res) => {
//   const { center, radius } = req.body;
  
//   try {
//     const cars = await Car.find({ owner: req.user._id });

//     const notifications = cars.map(car => {
//       const isInArea = geolib.isPointWithinRadius(
//         { latitude: car.location.coordinates[1], longitude: car.location.coordinates[0] },
//         { latitude: center.latitude, longitude: center.longitude },
//         radius
//       );

//       return {
//         carId: car._id,
//         inArea: isInArea,
//       };
//     });

//     res.json(notifications);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


