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
    }
}

module.exports = {
    responseStrings
}