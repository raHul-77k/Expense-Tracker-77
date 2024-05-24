const uuid = require('uuid');
const { SibApiV3Sdk, SendSmtpEmail, SendSmtpEmailTo } = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Forgotpassword = require('../models/forgotpassword');

const forgotpassword = async (req, res) => {
    try {
        const Email =  req.body.Email;
        console.log(Email)
        const user = await User.findOne({where : { Email }});
        if(user){
            const id = uuid.v4();
            user.createForgotpassword({ id , active: true })
                .catch(err => {
                    throw new Error(err)
                })

            sgMail.setApiKey(process.env.SENGRID_API_KEY)

            const msg = {
                to: email, // Change to your recipient
                from: 'example@gmail.com', // Change to your verified sender
                subject: 'Sending with SendGrid is Fun',
                text: 'and easy to do anywhere, even with Node.js',
                html: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
            }

            sgMail
            .send(msg)
            .then((response) => {

                // console.log(response[0].statusCode)
                // console.log(response[0].headers)
                return res.status(response[0].statusCode).json({message: 'Link to reset password sent to your mail ', sucess: true})

            })
            .catch((error) => {
                throw new Error(error);
            })

            //send mail
        }else {
            throw new Error('User doesnt exist')
        }
    } catch(err){
        console.error(err)
        return res.json({ message: err, sucess: false });
    }

}
const resetpassword = (req, res) => {
    try {
        const id = req.params.id;
        Forgotpassword.findOne({ where: { id } }).then(forgotpasswordrequest => {
            if (forgotpasswordrequest) {
                forgotpasswordrequest.update({ active: false });
                res.status(200).send(`<html>
                    <script>
                        function formsubmitted(e){
                            e.preventDefault();
                            console.log('called')
                        }
                    </script>
                    <form action="/password/updatepassword/${id}" method="post">
                        <label for="newpassword">Enter New password</label>
                        <input name="newpassword" type="password" required></input>
                        <button type="submit">Reset Password</button>
                    </form>
                </html>`);
            } else {
                res.status(404).json({ error: 'Invalid reset password request', success: false });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, success: false });
    }
};

const updatepassword = async (req, res) => {
    try {
        const { newpassword } = req.body;
        const { id } = req.params;
        const resetPasswordRequest = await Forgotpassword.findOne({ where: { id } });
        if (resetPasswordRequest) {
            const user = await User.findOne({ where: { id: resetPasswordRequest.userId } });
            if (user) {
                //encrypt the password
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(newpassword, saltRounds);
                await user.update({ password: hashedPassword });
                return res.status(201).json({ message: 'Password successfully updated', success: true });
            } else {
                return res.status(404).json({ error: 'User not found', success: false });
            }
        } else {
            return res.status(404).json({ error: 'Invalid reset password request', success: false });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: error.message, success: false });
    }
};

module.exports = {
    forgotpassword,
    updatepassword,
    resetpassword
};
