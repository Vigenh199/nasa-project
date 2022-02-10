const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const planets = require('./planets.mongo');

function isHabitablePlanet(planet) {
  return planet.koi_disposition === 'CONFIRMED'
    && planet.koi_insol > 0.36 && planet.koi_insol < 1.11
    && planet.koi_prad < 1.6;
}

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '../../data/kepler_data.csv'))
      .pipe(parse({
        comment: '#',
        columns: true,
      }))
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          await planets.updateOne({
            keplerName: data.kepler_name,
          }, {
            keplerName: data.kepler_name,
          }, {
            upsert: true,
          });
        }
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .on('end', async () => {
        console.log(`${await planets.countDocuments()} habitable planets found!`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({}, '-_id -__v');
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
}