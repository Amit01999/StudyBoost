const mongoose = require('mongoose');
require('dotenv').config();

// exports.connect = () => {
//   mongoose
//     .connect(process.env.MONGODB_URL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => console.log('DB Connected Successfully'))
//     .catch(error => {
//       console.log('DB Connection Failed');
//       console.log(error);
//       process.exit(1);
//     });
// };
exports.connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
