import jwt from 'jsonwebtoken';
import config from '../../config';

export class VerifyTokenService {
    public verifyToken(req: any, res: any, next: any): any {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).send({auth: false, message: 'No token provided'});
        }
        jwt.verify(token, config.secret, function(err: any, decoded: any) {
            if (err) {
                return res.status(500).send({auth: false, message: 'Failed to authenticate token'});
            }
            req.userId = decoded.id;
            next();
        });
    }
}