import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { format } from 'date-fns';
import md5 from 'md5';
import { encode } from 'js-base64';
import request from 'service/fetch';
import { ironOptions } from 'pages/api/config/index';
import { ISession } from '../index';

async function sendVerifyCode(req: NextApiRequest, res: NextApiResponse) {
  const { to = '', templateId = '1' } = req.body;
  const AppId = '8aaf0708800828310180135668210217';
  const AccountId = '8aaf0708800828310180135667300211';
  const AuthToken = '4f3812676f6f4582a2fbdfe12b09f6e0';
  const date = format(new Date(), 'yyyyMMddHHmmss');
  const SigParamter = md5(`${AccountId}${AuthToken}${date}`);
  const Authorization = encode(`${AccountId}:${date}`);

  const verifyCode = Math.floor(Math.random() * (9999 - 1000)) + 1000;
  const expireMinute = '10';
  const url = `https://app.cloopen.com:8883/2013-12-26/Accounts/${AccountId}/SMS/TemplateSMS?sig=${SigParamter}`;

  const session: ISession = req.session;

  const response = await request.post(
    url,
    {
      to,
      appId: AppId,
      templateId,
      datas: [verifyCode, expireMinute],
    },
    {
      headers: {
        Authorization,
      },
    }
  );
  const { statusCode, statusMsg, templateSMS } = response as any;

  if (statusCode === '000000') {
    session.verifyCode = verifyCode;
    await session.save();
    res.status(200).json({
      code: 0,
      msg: statusMsg,
      data: {
        templateSMS
      }
    });
  } else {
    res.status(200).json({
      code: statusCode,
      msg: statusMsg
    });
  }
}

export default withIronSessionApiRoute(sendVerifyCode, ironOptions);
