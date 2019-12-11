var Menu = [{
        name: '折叠控件',
        value: 'fold'
    }, {
        name: '动态添加控件',
        value: 'dynamic',
    }, {
        name: '数据关联',
        value: 'bind'
    }, {
        name: '基本信息数据地址',
        value: 'baseAjax'
    }, {
        name: '单行文本框',
        value: 'text',
    }, {
        name: '多行文本框',
        value: 'multText',
    }, {
        name: '单行输入框',
        value: 'input',
    }, {
        name: '多行输入框',
        value: 'textarea',
    }, {
        name: '时间控件',
        value: 'time',
    }, {
        name: '单选控件',
        value: 'radio',
    }, {
        name: '多选控件',
        value: 'checkbox',
    }, {
        name: '级联控件',
        value: 'levelselect',
    }],
    dynamicMenu = [{
        name: '单行文本框',
        value: 'text',
    }, {
        name: '多行文本框',
        value: 'multText',
    },{
        name: '单行输入框',
        value: 'input',
    }, {
        name: '多行输入框',
        value: 'textarea',
    }, {
        name: '时间控件',
        value: 'time',
    }, {
        name: '单选控件',
        value: 'radio',
    }, {
        name: '多选控件',
        value: 'checkbox',
    }, {
        name: '级联控件',
        value: 'levelselect',
    }],
    foldMenu = [{
        name: '单行文本',
        value: 'text',
    }, {
        name: '多行文本',
        value: 'multShow',
    }];

//功能组
$(".ContentBox_Title a[type]").click(function () {
    var self = $(this),
        type = self.attr('type');
    if (type == 'add') {
        addHtml(self, function (data) {
            contentRender(data);
        }); //添加
    } else if (type == 'refresh') {
        location.reload(); //刷新
    } else if (type == 'export' || type == 'preview') {
        var param = [];
        //数据整理
        $(".ContentBox_Main > div.Content_Moudle").each(function () {
            param.push(getJson($(this)));
        });

        //获取数据
        function getJson(sId) {
            var json = {
                index: sId.attr('index') || '',
                type: sId.attr('type') || '',
                text: sId.find(".Content_Moudle_Title span").eq(0).text() || ''
            };

            sId.children().eq(1).children().each(function () {
                var self = $(this),
                    input = self.find('[name]'),
                    name = input.attr('name') || '',
                    type = self.attr('type'),
                    val = input.val() || '',
                    label = self.find('label').text();

                //动态添加控件数据获取
                if (self.hasClass('dynamicBox') || self.hasClass('foldBox')) {
                    if (json.value) {
                        json[json.value] = [];
                        self.children().each(function () {
                            json[json.value].push(getJson($(this)));
                        });
                    }
                    return false;
                }

                if (type == 'add') return false; //按钮

                if (type == 'text' || type == 'textarea') {
                    json[name] = val;
                } else {
                    val = self.attr('value') || '';
                    json[name] = val;
                    json[name + 'text'] = val ? input.text() : '';
                }
            });

            return json;
        }

        if (type == 'export') {
            popup(param); //导出
        } else if (type == 'preview') {
            preview(param); //预览
        }
    } else if (type == 'Import') {
        popup();
    }
});

//导入导出
function popup(param) {
    $(".ContentBox .ContentBox_Import").remove();
    $(".ContentBox").append(
        '<div class="ContentBox_Import">' +
        '<div class="ContentBox_Import_Content" look="' + (param ? 'true' : 'false') + '">' +
        '<div class="ContentBox_Import_Head">数据内容<div class="ContentBox_Import_Head_Btn"><i type="copy"></i><i type="close"></i></div></div>' +
        (!param ? (
            '<div class="ContentBox_Import_Textarea"><textarea></textarea></div>' +
            '<div class="ContentBox_Import_Btn">导入</div>'
        ) : '<div class="ContentBox_Import_Textarea"><div class="textarea" isNull="' + (param.length > 0 ? 'false' : 'true') + '">' + (param.length > 0 ? formatJson(param) : '没有数据') + '</div></div>') +
        '</div>' +
        '</div>'
    );

    if (!param) {
        //导入点击
        $(".ContentBox .ContentBox_Import_Btn").unbind('click').bind('click', function () {
            var data = $(".ContentBox .ContentBox_Import textarea").val() || '';
            if (data) {
                try {
                    data = eval('(' + data + ')');
                } catch (err) {
                    $$.toast('数据结构错误');
                    return false;
                }
            }

            if ($$.typeOf(data) == 'object') {
                data = [data];
            }

            if ($$.typeOf(data) == 'array') {
                $(".ContentBox .ContentBox_Import").remove();

                contentRender(data);

                //对导入中的关联项进行处理
                $.each(data, function () {
                    var self = this,
                        box = $(".Content_Moudle[index='" + self.index + "']");
                    if (self.type == 'bind' && self.bind) {
                        var bindID = box.find('[name=bindID]').parent();
                        if (self.bind == 'text') {
                            bindID.before('<div type="text"><label>关联字段名</label><input type="text" name="bindName" placeholder="请填写" value="' + (self.bindName || '') + '" /></div>');
                            bindID.attr('type', 'text').find('[name=bindID]')[0].outerHTML = '<input type="text" name="bindID" placeholder="请填写" value="' + (self.bindID || '') + '" />';
                        } else {
                            $.each(data, function () {
                                if (self.bind == this.index) {
                                    if (this.type == 'text') {
                                        bindID.before('<div type="text"><label>关联字段名</label><input type="text" name="bindName" placeholder="请填写" value="' + (self.bindName || '') + '" /></div>');
                                        bindID.attr('type', 'text').find('[name=bindID]')[0].outerHTML = '<input type="text" name="bindID" placeholder="请填写" value="' + (self.bindID || '') + '" />';
                                    } else {
                                        bindID.attr({
                                            data: this.url || '',
                                            nameText: this.nameText || '',
                                            valueText: this.valueText || ''
                                        });
                                    }
                                    return false;
                                }
                            });
                        }
                    }

                    if (self.isTree && self.isTree == '0') {
                        box.find('[name=isTree]').parent().after('<div type="text"><label>父节点数据别名</label><input type="text" name="pidText" placeholder="请填写" value="' + (self.pidText || '') + '" /></div>');
                    }
                });
            } else {
                $$.toast('导入失败');
            }
        });
    }

    //关闭点击
    $(".ContentBox .ContentBox_Import_Head_Btn i[type=close]").unbind('click').bind('click', function () {
        $(".ContentBox .ContentBox_Import").remove();
    });

    //复制
    if (window['clipboard']) return false;
    window['clipboard'] = new ClipboardJS('.ContentBox .ContentBox_Import_Head i[type=copy]', {
        text: function () {
            var elem = $(".ContentBox_Import_Textarea .textarea");
            elem.length == 0 && (elem = $(".ContentBox_Import_Textarea textarea"));
            var text = elem.text() || elem.val(),
                isNull = elem.attr('isNull'); //是否为空 暂未使用
            //text = text.replace(/\t|\n|\s/g, '');
            return text;
        }
    });

    clipboard.on('success', function (e) {
        $$.toast('复制成功');
    });

    clipboard.on('error', function (e) {
        $$.toast('复制失败');
    });
}

//添加
function addHtml(self, callback) {
    var uuid = self.attr('uuid') || '',
        data = Menu,
        type = self.parents('.Content_Moudle').attr('type');
    if (uuid) {
        if (window[uuid]) {
            window[uuid].selectNone().show();
        }
        return false;
    }

    if (type == 'dynamic') {
        data = dynamicMenu;
    } else if (type == 'fold') {
        data = foldMenu;
    }

    uuid = $$.generateUUID();
    self.attr('uuid', uuid);
    window[uuid] = $$.showList({
        title: '添加类型',
        data: data,
        show: true,
        onChange: function (value, text) {
            if (value && text) {
                callback && callback({
                    type: value,
                    text: text
                });
            }
        }
    });
}

//预览展示
function preview(param) {
    if (!param) {
        $$.toast('请先添加内容');
        return false;
    }

    $(".ContentBox .ContentBox_Preview").remove();

    $$.Content_Form({
        elem: '.ContentBox_Preview .ContentBox_Preview_Content',
        data: param,
        callback: function (elem) {
            if (!elem || elem.length == 0) {
                $$.toast('请先添加内容');
                return false;
            }

            $(".ContentBox").append(
                '<div class="ContentBox_Preview">' +
                '<div class="ContentBox_Preview_Close">关闭</div>' +
                '<div class="ContentBox_Preview_Content"></div>' +
                '</div>'
            ).find('.ContentBox_Preview_Content').append(elem);

            //关闭
            $(".ContentBox .ContentBox_Preview_Close").unbind('click').bind('click', function () {

                $(".ContentBox_Preview [uuid]").each(function () {
                    var uuid = $(this).attr('uuid') || '';
                    if (uuid && window[uuid]) {
                        window[uuid].destroy && window[uuid].destroy();
                    }
                });

                $(".ContentBox .ContentBox_Preview").remove();
            });
        }
    });
}

//页面渲染
function contentRender(param) {
    var arr = [],
        html = '',
        type = $$.typeOf(param),
        duge = true;
    if (type == 'object') {
        arr.push(param);
        duge = false;
    } else if (type == 'array') {
        arr = param;
    }

    //数据遍历
    $.each(arr, function () {
        var self = this,
            type = self.type,
            data = '';
        if (type) {
            html +=
                '<div class="Content_Moudle" type="' + self.type + '" index="' + (self.index || $$.generateUUID()) + '">' +
                '<div class="Content_Moudle_Title"><span>' + self.text + '</span><a>删除</a></div>' +
                '<div class="Content_Moudle_Content">' +
                typeHtml(self) +
                '</div>' +
                '</div>';
        }
    });

    if (html) {
        $('.ContentBox_Main_Nothing').remove();
        if (duge) {
            $(".ContentBox_Main").html(html);
        } else {
            $(".ContentBox_Main").append(html);
            $(".ContentBox_Main")[0].scrollTop = $(".ContentBox_Main").scrollTop() + $(".ContentBox_Main .Content_Moudle").last().offset().top;
        }

        renderEvent(); //事件绑定
    }

    //删除
    $(".ContentBox_Main > .Content_Moudle > .Content_Moudle_Title a").unbind('click').bind('click', function () {
        var closeBox = $(this),
            parentBox = closeBox.parents('.Content_Moudle'),
            index = parentBox.attr('index') || '',
            duge = true;

        //数据关联
        $(".Content_Moudle[type=bind]").each(function () {
            var self = $(this),
                bind = self.find('[name=bind]').parent(),
                bindUuid = bind.attr('uuid') || '',
                bindValue = bind.attr('value') || '',
                bindID = self.find('[name=bindID]').parent(),
                unbind = self.find('[name=unbind]').parent(),
                unbindUuid = unbind.attr('uuid') || '',
                unbindValue = unbind.attr('value') || '';
            //关联项
            if (bindValue && bindValue == index) {
                $$.confirm('已进行数据关联，是否确认删除？', function () {
                    bindUuid && window[bindUuid].selectNone();
                    bind.attr({
                        value: '',
                        text: ''
                    }).find('span').html('请选择');
                    bindID.attr('type', 'select').find('[name=bindID]')[0].outerHTML = '<span name="bindID" data="">请选择</span>';
                    self.find('[name=bindName]').parent().remove();
                    Event();
                });

                duge = false;
            }

            //被关联项
            if (duge && unbindValue && unbindUuid && window[unbindUuid]) {
                unbindValue = unbindValue.split(',');
                $.each(unbindValue, function () {
                    if (this == index) {
                        $$.confirm('已进行数据关联，是否确认删除？', function () {
                            unbindUuid && window[unbindUuid].selectNone();
                            unbind.attr({
                                value: '',
                                text: ''
                            }).find('span').html('请选择');
                            Event();
                        });

                        duge = false;
                        return false;
                    }
                });

            }

            if (!duge) {
                return false;
            }
        });

        duge && Event();

        function Event() {
            closeBox.parents('.Content_Moudle').remove();

            if (!$.trim($(".ContentBox_Main").text())) {
                $(".ContentBox_Main").html('<div class="ContentBox_Main_Nothing">It\'s empty here.</div>');
            }
        }
    });

    //二级节点删除
    $(".ContentBox_Main .Content_Moudle_Content .Content_Moudle_Title a").unbind('click').bind('click', function () {
        $(this).parents('.Content_Moudle').eq(0).remove();
    });
}

//页面数据模板
function typeHtml(param) {
    var data = '',
        type = param.type,
        html = '';
    if (!type) {
        return false;
    }

    //模板汇总
    switch (type) {
        case 'baseAjax':
            data = "[{label: '数据地址',name: 'url'}]";
            break;
        case 'radio': //单选
        case 'checkbox': //多选
        case 'levelselect': //级联
            data =
                "[" +
                "{label: '数据地址',name: 'url'}," +
                "{label: '初始索引ID',name: 'data'}," +
                "{label: '初始索引文本',name: 'dataText'}," +
                "{label: 'Name别名',name: 'nameText'}," +
                "{label: 'Value别名',name: 'valueText'}," +
                "]";
            break;
        case 'time': //时间
            data =
                "[" +
                "{type: 'select',label: '时间格式',name: 'formatValue',data: [{name: '年-月',value: 'yyyy-MM'},{name: '年-月-日',value: 'yyyy-MM-dd'},{name: '年-月-日 时:分',value: 'yyyy-MM-dd hh:mm'}]}" +
                "]";
            break;
        case 'bind': //数据关联
            data =
                "[" +
                "{type: 'select',label: '关联项',name: 'bind'}," +
                "{type: 'select',label: '关联ID',name: 'bindID'}," +
                "{type: 'checkbox',label: '被关联项(显示)',name: 'unbind'}," +
                "{type: 'checkbox',label: '被关联项(隐藏)',name: 'unbindhide'}" +
                "]";
            break;
        case 'input':
        case 'textarea':
            data =
                "[" +
                "{type: 'text',label: '数据长度',name: 'length', isInt: 'true'}" +
                "]";
            break;
    }

    if (!data) {
        data = [];
    }

    if ($$.typeOf(data) == 'string') {
        data = eval('(' + data + ')');
    }

    //部分类型公共参数
    if (type != 'bind' && type != 'baseAjax') {
        data = [{
            label: '名称',
            name: 'name'
            }, {
            label: '字段名',
            name: 'value',
            }].concat(data);
    }

    //添加必填项
    var typeArray = 'input;textarea;time;radio;checkbox;levelselect';
    if (typeArray.indexOf(type) > -1) {
        data = [{
            type: 'select',
            label: '是否必填',
            name: 'must',
            data: [{
                name: '是',
                value: '1'
                }, {
                name: '否',
                value: '0'
                }]
            }].concat(data);
    }

    //单行输入框
    if (type == 'input') {
        data = data.concat([{
            type: 'select',
            label: '数据类型',
            name: 'isNumber',
            data: [{
                name: '整数',
                value: '1'
                }, {
                name: '保留两位小数',
                value: '2'
                }, {
                name: '身份证号码',
                value: '3'
                }, {
                name: '手机号码',
                value: '4'
                }, {
                name: '固定电话',
                value: '5'
                }, {
                name: '手机号码或者固定电话',
                value: '6'
                }, {
                name: '邮政编码',
                value: '7'
                }, {
                name: '邮箱',
                value: '8'
                }]
            }]);
    }

    //单选
    if (type == 'radio' || type == 'checkbox') {
        data = data.concat([{
                label: '影像关联ID',
                name: 'icvValue'
            },
            {
                label: '影像关联名称',
                name: 'icvName'
            }]);
    }

    //级联
    if (type == 'levelselect') {
        data = data.concat([{
            label: '子节点数据别名',
            name: 'childText'
        }, {
            type: 'select',
            label: '是否树型数据结构',
            name: 'isTree',
            data: [{
                name: '是',
                value: '1'
                }, {
                name: '否',
                value: '0'
                }]
            }]);
    }

    if (type == 'fold') {
        data = data.concat([{
            label: '简述',
            name: 'sketch'
        }]);
    }

    //动态添加
    if (type == 'dynamic' || type == 'fold') {
        data = data.concat([{
            type: 'add',
            label: '动态添加按钮'
        }]);
    }

    $.each(data, function () {
        var self = this;
        if (!self.type || self.type == 'text') {
            if (param.type == 'multShow' && self.name == 'value') {
                html +=
                    '<div type="textarea">' +
                    '<label>' + self.label + '</label>' +
                    '<textarea name="' + (self.name || '') + '" placeholder="请填写" >' + (param[self.name] || '') + '</textarea>';
            } else {
                var val = param[self.name] || '';
                val = val.replace(/"/g, "'");

                html += '<div type="text"><label>' + self.label + '</label><input type="text" name="' + (self.name || '') + '" placeholder="请填写" value="' + val + '"' + (self.isInt == 'true' ? (' oninput="$$.isNumbers(this, true)"') : '') + ' />';
            }
        } else if (self.type == 'add') {
            //渲染动态添加控件
            if (param.value && param[param.value]) {
                html += '<div class="' + param.type + 'Box">' + dynamicRender('', param[param.value]) + '</div>';
            }

            html += '<div type="add"><a>添加</a></div>';
        } else {
            var value = param[self.name + 'text'] || '';
            html +=
                "<div type='" + self.type + "' value='" + (param[self.name] || '') + "' text='" + value + "'" + (param.nameText ? (" nameText='" + param.nameText + "'") : '') + (param.valueText ? (" valueText='" + param.valueText + "'") : '') + ">" +
                "<label>" + self.label + "</label>" +
                "<span name='" + (self.name || '') + "' data='" + (self.data ? JSON.stringify(self.data) : '') + "'>" + (value || '请选择') + "</span>";
        }
        html += '</div>';
    });

    return html;
}

//页面渲染点击事件绑定
function renderEvent() {
    //单选 多选
    $(".Content_Moudle_Content > [type=select],.Content_Moudle_Content > [type=checkbox]").unbind('click').bind('click', function () {
        var self = $(this),
            parent = self.parents(".Content_Moudle"),
            label = self.find('label').text() || '',
            name = self.find('[name]').attr('name') || '',
            data = self.find('span[name]').attr('data') || '',
            inputType = self.attr('type') || '',
            type = parent.attr('type') || '',
            uuid = self.attr('uuid') || '',
            value = self.attr('value') || '',
            nameText = self.attr('nameText') || '',
            valueText = self.attr('valueText') || '';

        //数据关联
        if (type == 'bind') {
            switch (name) {
                case 'bind': //关联项
                    data = renderBindData('bind');
                    break;
                case 'bindID': //关联ID
                    var bindValue = parent.find('[name=bind]').parent().attr('value') || '';
                    if (!bindValue) {
                        $$.alert('请先选择关联项');
                        return false;
                    } else {
                        var bind = parent.find('[name=bind]').parent(),
                            bindID = parent.find('[name=bindID]').parent(),
                            url = bindID.attr('data') || '';
                        if (bindID.attr('type') != 'text') {
                            var bindBox = $(".ContentBox_Main .Content_Moudle[index='" + bindValue + "']"),
                                type = bindBox.attr('type');
                            !url && (url = bindBox.find('[name=url]').val() || '');
                            if (!url) {
                                $$.alert('请填写' + bind.find('[name=bind]').text() + '\n数据地址');
                                return false;
                            } else {
                                bindID.attr('data', url);
                                inputType = type == 'radio'?'select':type;
                                data = url;
                            }
                        }
                    }
                    break;
                case 'unbind': //被关联(显示)
                case 'unbindhide': //被关联(隐藏)
                    data = renderBindData('unbind');
                    break;
            }

            //关联数据遍历
            function renderBindData(dist) {
                var bindData = [],
                    bind = parent.find('[name=bind]').parent(),
                    unbind = parent.find('[name=unbind]').parent(),
                    bindValue = bind.attr('value') || '',
                    unbindValue = unbind.attr('value') || '';

                unbindValue = unbindValue.split(',');

                //整理数据
                $(".ContentBox .Content_Moudle").each(function () {
                    var self = $(this),
                        type = self.attr('type') || '',
                        index = self.attr('index') || '',
                        title = self.find('.Content_Moudle_Title span').text(),
                        bindType = 'radio;checkbox;levelselect', //允许关联类型
                        unbindType = 'radio;checkbox;levelselect;text;multText;input;textarea;time'; //允许关联类型

                    if ((dist == 'bind' ? bindType : unbindType).indexOf(type) > -1) {
                        var name = self.find('[name=name]').val() || '',
                            duge = true;

                        if (dist == 'bind') {
                            $.each(unbindValue, function () {
                                this == index && (duge = false);
                            });
                        } else {
                            duge = bindValue != index;
                        }
                        //去除已选被关联项
                        if (duge) {
                            name && bindData.push({
                                name: name, // + ' (' + title + ')',
                                value: index
                            });
                        }
                    }
                });

                //添加纯文本关联项
                if (dist == 'bind') {
                    bindData.push({
                        name: '纯文本关联',
                        value: 'text'
                    });
                }

                if (bindData.length == 0) {
                    $$.alert('请添加文本/控件\n（名称不能为空）');
                }

                return bindData;
            }
        }

        //已绑定
        if (uuid && window[uuid]) {
            if (type == 'bind' && (name == 'bind' || name == 'unbind')) {
                var active = window[uuid].value(),
                    index = ''; //当前索引
                $.each(data || [], function (i) {
                    var self = this;
                    if (name == 'bind') {
                        if (self.value == active) {
                            index = i;
                        }
                    } else {
                        $.each(active.split(','), function () {
                            if (self.value == this) {
                                index && (index += ',');
                                index += i.toString();
                            }
                        });
                    }
                });
                window[uuid].option('data', data || []).selectNone();
                index.toString() && window[uuid].active(index);

                if (!data || data.length == 0) {
                    return false;
                }
            }

            window[uuid].show();
            return false;
        }

        if (!data || data.length == 0) return false; //没有数据不绑定
        if ($$.typeOf(data) == 'string') {
            try {
                data = eval('(' + data + ')');
            } catch (err) {
                $$.ajaxRequest({
                    url: data,
                    success: function (result) {
                        data = result;
                        bindEvent();
                    }
                });

                return false;
            }
        }

        bindEvent();

        function bindEvent() {
            uuid = $$.generateUUID();
            self.attr('uuid', uuid);
            window[uuid] = $$.showList({
                title: label,
                type: inputType == 'select' ? 'radio' : inputType,
                data: data,
                value: value,
                fieldName: nameText,
                fieldValue: valueText,
                show: true,
                onChange: function (value, text) {
                    value == 'on' && (value = '');
                    self.attr({
                        value: value || '',
                        text: text || ''
                    }).find('span').html(text || '请选择');

                    if (type == 'bind' && name == 'bind') {
                        var curt = $(".ContentBox_Main .Content_Moudle[index='" + value + "']"),
                            curtType = curt.attr('type') || '',
                            bindID = self.parent().find('[name=bindID]').parent(),
                            uuid = bindID.attr('uuid') || '';
                        
                        if(window[uuid]){
                            window[uuid].selectNone();
                            window[uuid].destroy();
                            bindID.attr({
                                value: '',
                                text: '',
                                uuid: ''
                            });
                        }
                        
                        if ((value && !curtType) || curtType == 'text' || curtType == 'textarea') {
                            if (self.parent().find('[name=bindName]').length == 0) {
                                bindID.before('<div type="text"><label>关联字段名</label><input type="text" name="bindName" placeholder="请填写" /></div>');
                            }
                            bindID.attr('type', 'text').find('[name=bindID]')[0].outerHTML = '<input type="text" name="bindID" placeholder="请填写" />';
                        } else {
                            bindID.attr('type', 'select').find('[name=bindID]')[0].outerHTML = '<span name="bindID" data="">请选择</span>';
                            self.parent().find('[name=bindName]').parent().remove();

                            if (curt.length > 0) {
                                var url = curt.find('[name=url]').val() || '';
                                if (url) {
                                    bindID.attr({
                                        data: url,
                                        nameText: curt.find('[name=nameText]').val() || '',
                                        valueText: curt.find('[name=valueText]').val() || '',
                                    });
                                    renderEvent();
                                }
                            }
                        }
                    }

                    if (name == 'isTree') {
                        if (value == '0') {
                            self.parent().find('[name=isTree]').parent().after('<div type="text"><label>父节点数据别名</label><input type="text" name="pidText" placeholder="请填写" /></div>');
                        } else {
                            self.parent().find('[name=pidText]').parent().remove();
                        }
                    }
                }
            });
        }
    });

    //动态添加
    $(".Content_Moudle_Content > [type=add] a").unbind('click').bind('click', function () {
        var self = $(this);
        addHtml(self, function (data) {
            dynamicRender(self.parent(), data);
        });
    });
}

//动态添加控件渲染
function dynamicRender(sId, param) {
    var dataType = $$.typeOf(param),
        arr = [],
        html = '',
        type = sId ? sId.parents('.Content_Moudle').attr('type') : '',
        box = type ? sId.parent().find('.' + type + 'Box') : '';
    if (dataType == 'object') {
        arr.push(param);
        duge = false;
    } else if (dataType == 'array') {
        arr = param;
    }

    if (box && box.length == 0) {
        sId.before('<div class="' + type + 'Box"></div>');
        box = sId.parent().find('.' + type + 'Box');
    }

    $.each(arr, function () {
        var self = this;
        html +=
            '<div class="Content_Moudle" type="' + self.type + '" index="' + (self.index || $$.generateUUID()) + '">' +
            '<div class="Content_Moudle_Title"><span>' + self.text + '</span><a>删除</a></div>' +
            '<div class="Content_Moudle_Content">' +
            typeHtml(self) +
            '</div>' +
            '</div>';
    });

    if (box) {
        box.append(html);

        renderEvent();
    } else {
        return html;
    }

    //删除
    $(".ContentBox_Main ." + type + "Box .Content_Moudle_Title a").unbind('click').bind('click', function () {
        $(this).parents('.Content_Moudle').eq(0).remove();
    });
}

//json转换
function formatJson(param) {
    var rep = "~";
    var jsonStr = JSON.stringify(param, null, rep)
    var str = "";
    for (var i = 0; i < jsonStr.length; i++) {
        var text2 = jsonStr.charAt(i)
        if (i > 1) {
            var text = jsonStr.charAt(i - 1)
            if (rep != text && rep == text2) {
                str += "<br/>"
            }
        }
        str += text2;
    }
    jsonStr = "";
    for (var i = 0; i < str.length; i++) {
        var text = str.charAt(i);
        if (rep == text)
            jsonStr += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
        else {
            jsonStr += text;
        }
        if (i == str.length - 2)
            jsonStr += "<br/>"
    }
    return jsonStr;
}
