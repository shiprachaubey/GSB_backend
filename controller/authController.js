const User = require('../model/User');
const client = require('../config/twilio');

exports.sendOTP = async (req, res) => {
  const { fullName, phoneNumber } = req.body;

  console.log("➡️ Received request to send OTP");
  console.log("📨 Request Body:", req.body);

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60000); // 5 minutes from now

  try {
    let user = await User.findOne({ phoneNumber });

    console.log("🔍 User found:", user);

    if (!user) {
      console.log("🆕 Creating new user");
      user = new User({ fullName, phoneNumber, otp, otpExpiresAt });
    } else {
      console.log("🔁 Updating existing user's OTP");
      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
    }

    await user.save();
    console.log("💾 User saved with OTP:", otp);

    // Sending the OTP via Twilio
    const twilioResponse = await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: phoneNumber
    });

    console.log("📤 Twilio message sent:", twilioResponse.sid);

    res.status(200).json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error("❌ Error occurred while sending OTP:", error);

    // Respond with detailed error for development (limit in production)
    res.status(500).json({ error: 'Failed to send OTP', debug: error.message });
  }
};


exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Optionally clear OTP after success
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'OTP verification failed' });
  }
};
