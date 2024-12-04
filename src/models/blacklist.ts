import { Schema, model } from 'mongoose';
import { IBlacklist } from '../types/blacklist';

const blacklistSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  expiry: {
    type: Date,
    required: true,
  },
});

const Blacklist = model<IBlacklist>('Blacklist', blacklistSchema);

export default Blacklist;
