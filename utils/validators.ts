import validator from 'validator';

export const validateEmail = (email: string): boolean => validator.isEmail(email) && email.endsWith("ifb.edu.br");;

export const validatePassword = (password: string): boolean => 
    validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    });
