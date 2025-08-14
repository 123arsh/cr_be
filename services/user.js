const jwt = require('jsonwebtoken');
const secretKey = process.env.SecretKey || 'Bhagwanpbhibhrosabhikrnhipaarhacarrierpdhyaannhilgrhabasabbyhiumeedhkikuchashahojyejindgim';

/*Creating Tokens*/
const CreateTokenForUser = (user) => {
    if(!user || !user.id){
        throw new Error('User Details Not Found!!!');
    }
    const payload = {
        _id: user._id.toString(),
        lastName: user.lastName || '',
        email: user.email || ''
    }

    return jwt.sign(payload, secretKey, { expiresIn: '7d' })
}

/*Validating Tokens*/
const validateToken = (token) => {
    if(!token) {
        throw new Error('Invalid token or token not found');
    }
    try{
        const decode = jwt.verify(token, secretKey);
        return decode;
    }
    catch(err){
        throw new Error('Invalide token or secret key');
    }
}

module.exports = {
    CreateTokenForUser,
    validateToken
}