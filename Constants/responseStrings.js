const responseStrings = {
    loginAccount: {
        usernamePassMissing: "Please enter both your username and password to proceed.",
        accountNotFound: "Account not found. Please check your username or password and try again",
        incorrectPass: "Whoops! That password didn't work. Give it another shot!",
        incorrectPassCondition: "Incorrect Pass",
        serverError: "Oops! Something went wrong on our end. Please hang tight and try again shortly."

    },
    checkAccount: {
        fieldsMissing: "Username, password, or email is missing. Please fill in all fields.",
        usernameTaken: "Username already taken. Try something unique!",
        emailExists: "Email already exists. Try logging in or use a different email.",
        newUser: "This is new user",
        serverError: "Oops! Something went wrong on our end. Please hang tight and try again shortly."
    },
    createAccount: {
        fieldsMissing: "Username, password, or email is missing. Please fill in all fields.",
        accountCreated: "Account created! Welcome aboard!",
        serverError: "Oops! Something went wrong on our end. Please hang tight and try again shortly."
    },
    changePass: {
        passwordMissing: "Please enter your password.",
        emailMissing: "Please enter your email.",
        passwordUpdated: "Your password has been updated successfully. You're all set! 🌟🔒",
        otpNotVerified: "The OTP verification failed. Please try again."
    },
    sendOtp: {
        emailDosentExist: "The email address doesn't exist. Sign up with this email to create a new account.",
        otpSent: "OTP sent successfully. Please check your email."
    },
    verifyOtp: {
        otpVerified: "OTP verified successfully. You're all set!",
        otpIncorrect: "The OTP entered is incorrect. Please double-check and try again."
    }
}

module.exports = {
    responseStrings
}