/**
 * Created by guowei on 17/4/1.
 */
//名值对转换为字符串
function params(data) {
    var arr = [];
    for (var i in data) {
        //特殊字符传参产生的问题可以使用encodeURIComponent()进行编码处理
        arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
    }
    return arr.join('&');
}

function ajax(options) {
    const defaultOptions = {
        method: 'post',
        url: '',
        data: null,
        dataType: 'object',
        success: ()=> {
        },
        error: ()=> {
        },
        files: null,
        async: true,
        headers: {},
        timeout: 0
    };
    options = {...defaultOptions, ...options};
    options.method = options.method.toLowerCase();
    let sendData = null;
    if (options.files) {
        options.method = 'post';
        const fd = new FormData();
        for (let key in options.data) {
            fd.append(key, options.data[key]);
        }
        for (let key in options.files) {
            fd.append(key, options.files[key], options.files[key].name || 'temp.png');
        }
        sendData = fd;
    } else if (options.method == 'post') {
        switch (options.dataType) {
            case 'json':
                sendData = JSON.stringify(options.data);
                options.headers['Content-Type'] = 'application/json';
                break;
            default:
                sendData = params(options.data);
                options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                break;
        }
    }

    //创建XHR对象
    const xhr = new XMLHttpRequest();
    xhr.timeout = options.timeout;
    xhr.onload = function () {
        if (this.status == 200 || this.status == 304) {
            options.success(this.responseText);
        } else {
            options.error(this.status, this.responseText);
        }
    };
    xhr.ontimeout = function (e) {
        options.error(408, '超时');
    };
    xhr.onerror = function () {
        options.error(this.status, '无法连接服务器');
    };
    xhr.open(options.method, options.url, options.async);

    for (let key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key]);
    }
    xhr.send(sendData);
}
export default ajax;