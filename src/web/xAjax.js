/**
 * Created by guowei on 17/4/3.
 */
import Promise from 'bluebird'
import alert from 'fs-alert'
import ajax from './ajax'

function ErrorPrompt(message, callback) {
    this.prompt = true;
    this.message = message;
    this.callback = callback;
}
function isErrorPrompt(e) {
    return e.prompt;
}
function promiseAjax(url, data, files) {
    return new Promise((resolve, reject)=> {
        ajax({
            method: 'post',
            url,
            data,
            files,
            success: (res)=> {
                resolve(res);
            },
            error: (status, text)=> {
                const msg = (status || 500) + ',服务器无法正常提供信息';
                reject(new ErrorPrompt(msg))
            }
        });
    });
}
function jsonParse(body) {
    let res;
    try {
        res = JSON.parse(body);

    } catch (e) {
        throw new ErrorPrompt('输出格式错误！');
    }
    if (typeof res != "object") {
        throw new ErrorPrompt('输出格式错误！');
    }
    return res;
}
function dataParse(res) {
    if (!res.result) {
        if (res.errorcode == null) {
            throw new ErrorPrompt('输出格式错误,无效errorcode！');
        }
        if (res.errorcode == 1) {
            //1 没有登录
            throw new ErrorPrompt('您的账户已失效，请重新登录！', ()=> {
                if ("function" == typeof window.loginAgain) {
                    window.loginAgain();
                }
            });
        }
        if (res.errorcode == 2) {
            //2 没有权限
            throw new ErrorPrompt(res.msg);
        }
        if (res.errorcode == 0) {
            //0 错误提示
            let msg = '';
            if (typeof res.msg == "object") {
                msg = JSON.stringify(res.msg);
            } else {
                msg = res.msg;
            }
            throw new ErrorPrompt(msg);
        }
    }
    const {result,errorcode,...other}=res;
    return {ok: result, ...other, code: errorcode};
}
function request(url, data, files) {
    const servicesPrefix = window.servicesPrefix || "";

    return promiseAjax(servicesPrefix + url, {data: JSON.stringify(data)}, files)
        .then(jsonParse)
        .then(dataParse)
        .catch(isErrorPrompt, (e)=> {
            alert('', e.message, [{
                text: "确定",
                onClick: ()=> {
                    console.log()
                    if ("function" == typeof e.callback) {
                        e.callback();
                    }
                }
            }]);
            return {ok: false, msg: e.message, code: 0}
        })
}
export default request;