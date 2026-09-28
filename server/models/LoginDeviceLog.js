import mongoose from 'mongoose';
import LoginLog from './LoginLog.js';

const LoginDeviceLog = mongoose.models.LoginDeviceLog || mongoose.model('LoginDeviceLog', LoginLog.schema);

export default LoginDeviceLog;
