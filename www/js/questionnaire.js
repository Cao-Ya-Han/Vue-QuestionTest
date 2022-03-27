const controlEnum = Object.freeze({
    textbox: 'form-textbox',
    radio: 'form-radio',
    checkbox: 'form-checkbox',
    range: 'form-range',
    number: 'form-number',
    date: 'form-date',
    datetime: 'form-datetime',
    file: 'form-file',
});
let apiUrl = `http://${localStorage.getItem("ipSet")}`;

class fieldControl {
    constructor(data) {
        this.questSysId = data.questSysId == undefined ? 0 : data.questSysId;
        this.id = data.id == undefined ? '' : data.id;
        this.name = data.name == undefined ? '' : data.name;
        this.type = data.type == undefined ? '' : data.type;
        this.title = data.title == undefined ? '未命名的問題' : data.title;
        this.value = data.value == undefined ? '' : data.value;
        this.min = data.min == undefined ? 0 : data.min;
        this.max = data.max == undefined ? 100 : data.max;
        this.step = data.step == undefined ? 10 : data.step;
        this.date = data.date == undefined ? '' : data.date;
        this.time = data.time == undefined ? '' : data.time;

        this.values = data.value == undefined ? [] : data.value;
        this.required = data.required == undefined ? false : data.required;   // 是否必填
        this.isEdit = data.isEdit == undefined ? false : data.isEdit;         // 是否編輯
    }
}

//#region axios interceptors
function readConfig() {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, "application/xml");
        console.log(doc.getElementsByTagName("configuration").item(0).textContent);
    });
    xhr.open("get", "../config.xml", true);
    xhr.send();
}
/**
 * axios request add header
 */
axios.interceptors.request.use(request => {
    request.url = apiUrl + request.url;
    const user = getStorageItem("userInfo");
    if (user != null) {
        //console.log(user.bearer)
        request.headers.Authorization = `Basic ${user.bearer}`;
    }
    return request;
}, e => {
    return Promise.reject(e);
});
/**
 * axios response 序列化 data
 */
axios.interceptors.response.use((response) => {
    return JSON.parse(response.data);
}, (e) => {
    return Promise.reject(e);
});
//#endregion

//#region method
/**
 * Clone 物件
 * @param {*} obj 
 * @returns 
 */
function clone(obj) {
    let value = JSON.stringify(obj);
    return JSON.parse(value);
}

/**
 * 設定 localStorage 
 * @param {*} key 
 * @param {*} obj 
 */
function setStorageItem(key, obj) {
    const value = JSON.stringify(obj);
    localStorage.setItem(key, value);
}
/**
 * 取得 localStorage 
 * @param {*} key 
 * @param {*} obj 
 * @returns 
 */
function getStorageItem(key, obj) {
    const value = localStorage.getItem(key);
    return JSON.parse(value);
}
/**
 * 取得指定時間
 * @param {*} hour 
 * @returns 
 */
function getDateTime(hour) {
    var dt = new Date();
    var yyyy = dt.getFullYear();
    var MM = dt.getMonth();
    var dd = dt.getDate();
    return new Date(yyyy, MM, dd, hour, 0);
}
/**
 * 顯示 年月日時分秒
 * @param {*} value 
 * @returns 
 */
function getYYYYMMDDHHmm(value) {
    return moment(value)
        .local()
        .format('YYYY-MM-DD HH:mm')
}

function getYYYYMMDDTHHmm(value) {
    return moment(value)
        .local()
        .format('YYYY-MM-DD[T]HH:mm')
}
/**
 * 顯示 年月日
 * @param {*} value 
 * @returns 
 */
function getYYYYMMDD(value) {
    return moment(value)
        .local()
        .format('YYYY-MM-DD')
}
/**
 * 顯示時間
 * @param {*} value 
 * @returns 
 */
function getHHmm(value) {
    return moment(value)
        .local()
        .format('HH:mm')
}
/**
 * 檢查時間
 * @param {*} startAt 
 * @param {*} endAt 
 * @returns 
 */
function validateDate(startAt, endAt) {
    const sDt = moment(startAt)
    const eDt = moment(endAt)
    const diffDay = eDt.diff(sDt)
    return diffDay < 0 ? true : false
}
function message(res) {
    if (res == undefined) {
        return false;
    }
    if (res.ResultCode !== 10) {
        console.log(res)
        alert(res.Message);
        return false;
    }
    return true
}

function checkComfirm(text) {
   return new Promise((resolve, reject) => {
        var flag = confirm(text);
        resolve(flag)
    })
}

function goPage(name, param) {
    let url = `${name}.html?`;
    window.location.href = url + param;
}

function encode(str) {
    // 对字符串进行编码
    var encode = encodeURI(str);
    // 对编码的字符串转化base64
    var base64 = btoa(encode);
    return base64;ƒ
}

function base64File(path) {
    return new Promise((resolve, reject) => {
        window.resolveLocalFileSystemURL(path, x => {
            x.file(function (file) {
                var reader = new FileReader();
                reader.onloadend = function (e) {
                    var content = this.result;
                    resolve(this.result)
                };
                reader.readAsDataURL(file);
            });
        }, e => {

        });
    })
}

function statusBar(show = false){
    StatusBar.overlaysWebView(show);
} 

//#endregion 

//#region component
/**
 * 文字題
 */
Vue.component('form-textbox', {
    template: '#form-textbox',
    props: {
        field: fieldControl
    },
    created: function () {
    },
    methods: {
        onChang(el) {
            console.log(el);
        },
        onRemove: function (row) {
            this.$emit('on-remove', row);
        }
    }
});
/**
 * 單選題
 */
Vue.component('form-radio', {
    template: '#form-radio',
    data: function () {
        return {
            selected: true
        }
    },
    props: {
        field: fieldControl
    },
    created: function () {
        if (this.field.values.length <= 0) {
            this.field.values = [{
                index: 1,
                label: '請輸入選項',
                value: 1
            }];
        }

    },
    methods: {
        onSelected: function () {
            this.selected = !this.selected;
        },
        onAdd: function () {
            const last = this.field.values[this.field.values.length - 1];
            const elm = clone(last);

            elm.index += 1;
            elm.value += 1;
            // elm.label = `請輸入選項 ${elm.value}`;
            elm.label = `請輸入選項`;
            elm.per
            this.field.values.push(elm);
        },
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
        onItemRemove: async function (id) {
            console.log('onItemRemove')

            if (this.field.values.length <= 1) {
                alert('無法刪除');
                return;
            }

            this.field.values = await this.field.values.filter(x => {
                return x.index != id;
            })

            this.field.values.forEach((e, index) => {
                e.index = index + 1
            });
        },
    }
});
/**
 * 複選題
 */
Vue.component('form-checkbox', {
    template: '#form-checkbox',
    data: function () {
        return {
            selected: true
        }
    },
    props: {
        field: fieldControl,
    },
    created: function () {
        if (this.field.values.length <= 0) {
            // 問卷
            this.field.values = [{
                index: 1,
                label: '選項 1',
                value: false
            }];
        }

    },
    methods: {
        onSelected: function () {
            this.selected = !this.selected;
        },
        onAdd: function () {
            const last = this.field.values[this.field.values.length - 1];
            const elm = clone(last);
            elm.index += 1;
            elm.value = false;
            elm.label = `選項 ${elm.index}`
            this.field.values.push(elm);
        },
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
        onItemRemove: async function (id) {
            if (this.field.values.length <= 1) {
                alert('無法刪除');
                return;
            }
            this.field.values = await this.field.values.filter(x => {
                return x.index != id;
            })
            this.field.values.forEach((e, index) => {
                e.index = index + 1
            });
        },
    }
});
/**
 * 數字滑桿題 
 */
Vue.component('form-range', {
    template: '#form-range',
    props: { field: fieldControl },
    created: function () {
        this.field.min = 0;
        this.field.max = 100;
        this.field.step = 10;
        this.field.value = 0;
    },
    methods: {
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
    }
});
/**
 * 數字題 
 */
Vue.component('form-number', {
    template: '#form-number',
    props: { field: fieldControl },
    created: function () {
        this.field.min = 0;
        this.field.max = 100;
    },
    methods: {
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
    }
});
/**
 * 日期題 
 */
Vue.component('form-date', {
    template: '#form-date',
    props: { field: fieldControl },
    created: function () {
        this.field.date = moment().format('YYYY-MM-DD');
        console.log(this.field);
    },
    methods: {
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
    }
});
/**
 * 日期時間題 
 */
Vue.component('form-datetime', {
    template: '#form-datetime',
    props: { field: fieldControl },
    created: function () {
        this.field.date = moment().format('YYYY-MM-DD');
        this.field.time = moment().format('HH:MM');
        console.log(this.field);
    },
    methods: {
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
    }
});
/**
 * 檔案題元件
 */
Vue.component('form-file', {
    template: '#form-file',
    props: { field: fieldControl },
    created: function () {
        this.field.min = 10;
        this.field.max = 10;
    },
    methods: {
        onRemove: function (row) {
            this.$emit('on-remove', row);
        },
    }
});
//#endregion
