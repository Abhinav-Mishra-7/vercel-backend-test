
const validator = require("validator") ;


const validate = (data)=>{

    // Checking if there is any missing field 
    const maindatoryField = ['firstName' , 'emailId' , 'password'] ;

    const isAllowed = maindatoryField.every((key)=> Object.keys(data).includes(key)) ;

    if(!isAllowed)
        throw new Error("Some Field is missing") ;

    // checking for valid emailId
    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Credentials") ;

    // Checking for strong password
    if(!validator.isStrongPassword(data.password))
        throw new Error("Invalid Credentials") ;

}


module.exports = validate ;