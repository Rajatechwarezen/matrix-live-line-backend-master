const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let PollOptionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  },
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },
  createdAt: {
    type: Number,
    default: () => Date.now()
  }
});
// PollOptionSchema.pre('remove', function (next) {
//     const pollId = this["pollId"];
//     mongoose.model("Poll").updateOne({ '_id': pollId }, { $pull: { "optionsList": this["_id"] } }, function (err, data) {
//         if (err) {
//             next(err);
//         }
//         next();
//     })
// });
PollOptionSchema.pre('remove', async function (next) {
  console.log('@@@@@@@@@@');
  try {
    const pollId = this["pollId"];
    const delData = await mongoose.model("Poll").updateOne({ '_id': pollId }, { $pull: { "optionsList": this["_id"] } });
    console.log('delData__________', delData);
    next();
  } catch (err) {
    next(err);
  }
});
PollOptionSchema.pre('save', async function (next) {
  try {
    const pollId = this["pollId"];
    const saveData = await mongoose.model("Poll").updateOne({ '_id': pollId }, { "$addToSet": { optionsList: this["_id"] } })
    console.log('saveData_______', saveData);
    next();
  } catch (err) {
    next(err);
  }
});
// PollOptionSchema.pre('save', function (next) {
//   const pollId = this["pollId"];
//   mongoose.model("Poll").updateOne({ '_id': pollId }, { "$addToSet": { optionsList: this["_id"] } }, function (err, data) {
//     if (err) {
//       next(err);
//     }
//     next();
//   })
// });
PollOptionSchema.options.toJSON = {
  transform: function (doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
};
module.exports = mongoose.model("PollOption", PollOptionSchema, "PollOption");
