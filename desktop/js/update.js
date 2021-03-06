/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */


 printUpdate();

 $("#md_specifyUpdate").dialog({
    autoOpen: false,
    modal: true,
    height: 300,
    width: 400,
    open: function () {
        $("body").css({overflow: 'hidden'});
    },
    beforeClose: function (event, ui) {
        $("body").css({overflow: 'inherit'});
    }
});

 $('#bt_reapplyUpdate').on('click', function () {
  $('#md_specifyUpdate').dialog({title: "{{Options}}"});
  $("#md_specifyUpdate").dialog('open');
});

 $('#bt_reapplySpecifyUpdate').on('click',function(){
     var level = "-1";
     var mode = '';
     if($('#cb_forceReapplyUpdate').value() == 1){
        mode = 'force';
    }
    jeedom.update.doAll({
        mode: mode,
        level: level,
        version : $('#sel_updateVersion').value(),
        onlyThisVersion : ($('#cb_allFromThisUpdate').value() == 1) ? 'no':'yes',
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function () {
           $("#md_specifyUpdate").dialog('close');
           getJeedomLog(1, 'update');
       }
   });
});

 $('.bt_updateAll').on('click', function () {
  var level = $(this).attr('data-level');
  var mode = $(this).attr('data-mode');
  bootbox.confirm('{{Etes-vous sur de vouloir faire les mises à jour ?}} ', function (result) {
    if (result) {
        $.hideAlert();
        jeedom.update.doAll({
            mode: mode,
            level: level,
            error: function (error) {
                $('#div_alert').showAlert({message: error.message, level: 'danger'});
            },
            success: function () {
                getJeedomLog(1, 'update');
            }
        });
    }
});
});

 $('#bt_checkAllUpdate').on('click', function () {
    $.hideAlert();
    jeedom.update.checkAll({
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function () {
            printUpdate();
        }
    });
});


 $('#table_update').delegate('.update', 'click', function () {
    var id = $(this).closest('tr').attr('data-id');
    bootbox.confirm('{{Etes vous sur de vouloir mettre à jour cet objet ?}}', function (result) {
        if (result) {
            $.hideAlert();
            jeedom.update.do({
                id: id,
                error: function (error) {
                    $('#div_alert').showAlert({message: error.message, level: 'danger'});
                },
                success: function () {
                    getJeedomLog(1, 'update');
                }
            });
        }
    });
});

 $('#table_update').delegate('.remove', 'click', function () {
    var id = $(this).closest('tr').attr('data-id');
    bootbox.confirm('{{Etes vous sur de vouloir supprimer cet objet ?}}', function (result) {
        if (result) {
            $.hideAlert();
            jeedom.update.remove({
                id: id,
                error: function (error) {
                    $('#div_alert').showAlert({message: error.message, level: 'danger'});
                },
                success: function () {
                    printUpdate();
                }
            });
        }
    });
});

 $('#table_update').delegate('.checkUpdate', 'click', function () {
    var id = $(this).closest('tr').attr('data-id');
    $.hideAlert();
    jeedom.update.check({
        id: id,
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function () {
            printUpdate();
        }
    });

});

 $('#table_update').delegate('.view', 'click', function () {
    $('#md_modal').dialog({title: "Market"});
    $('#md_modal').load('index.php?v=d&modal=market.display&type=' + $(this).closest('tr').attr('data-type') + '&logicalId=' + encodeURI($(this).closest('tr').attr('data-logicalId'))).dialog('open');
});

 $('#table_update').delegate('.sendToMarket', 'click', function () {
    $('#md_modal').dialog({title: "Partager sur le market"});
    $('#md_modal').load('index.php?v=d&modal=market.send&type=' + $(this).closest('tr').attr('data-type') + '&logicalId=' + encodeURI($(this).closest('tr').attr('data-logicalId')) + '&name=' + encodeURI($(this).closest('tr').attr('data-logicalId'))).dialog('open');
});

 $('#bt_expertMode').on('click', function () {
    printUpdate();
});

 function getJeedomLog(_autoUpdate, _log) {
    $.ajax({
        type: 'POST',
        url: 'core/ajax/log.ajax.php',
        data: {
            action: 'get',
            log: _log,
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            setTimeout(function () {
                getJeedomLog(_autoUpdate, _log)
            }, 1000);
        },
        success: function (data) {
            if (data.state != 'ok') {
                setTimeout(function () {
                    getJeedomLog(_autoUpdate, _log)
                }, 1000);
                return;
            }
            var log = '';
            if($.isArray(data.result)){
                for (var i in data.result.reverse()) {
                    log += data.result[i]+"\n";
                    if(data.result[i].indexOf('[END ' + _log.toUpperCase() + ' SUCCESS]') != -1){
                        printUpdate();
                        $('#div_alert').showAlert({message: '{{L\'opération est réussie}}', level: 'success'});
                        _autoUpdate = 0;
                    }
                    if(data.result[i].indexOf('[END ' + _log.toUpperCase() + ' ERROR]') != -1){
                        printUpdate();
                        $('#div_alert').showAlert({message: '{{L\'opération a échoué}}', level: 'danger'});
                        _autoUpdate = 0;
                    }
                }
            }
            $('#pre_' + _log + 'Info').text(log);
            $('#pre_updateInfo').parent().scrollTop($('#pre_updateInfo').parent().height() + 200000);
            if (init(_autoUpdate, 0) == 1) {
                setTimeout(function () {
                    getJeedomLog(_autoUpdate, _log)
                }, 1000);
            } else {
                $('#bt_' + _log + 'Jeedom .fa-refresh').hide();
                $('.bt_' + _log + 'Jeedom .fa-refresh').hide();
            }
        }
    });
}

function printUpdate() {
    jeedom.update.get({
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (data) {
            $('#table_update tbody').empty();
            for (var i in data) {
                addUpdate(data[i]);
            }
            $('#table_update').trigger('update');
            initTooltips();
        }
    });

    jeedom.config.load({
        configuration: {"update::lastCheck":0,"update::lastDateCore": 0},
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (data) {
            $('#span_lastUpdateCheck').value(data['update::lastCheck']);
            $('#span_lastCoreUpdate').value(data['update::lastDateCore']);
        }
    });
}

function addUpdate(_update) {
    if (_update.status != 'update' && _update.type != 'core') {
        if ($('#bt_expertMode').attr('state') == 0) {
            return;
        }
    }
    var tr = '<tr data-id="' + init(_update.id) + '" data-logicalId="' + init(_update.logicalId) + '" data-type="' + init(_update.type) + '">';
    tr += '<td><span class="updateAttr" data-l1key="id" style="display:none;"></span><span class="updateAttr" data-l1key="source"></span> / <span class="updateAttr" data-l1key="type"></span> : <span class="updateAttr label label-info" data-l1key="name" style="font-size:0.96em;"></span></td>';
    tr += '<td><span class="updateAttr label label-primary" data-l1key="localVersion" style="font-size:0.96em;"></span><br/><span class="updateAttr" data-l1key="remoteVersion"></span></td>';
    tr += '<td><span class="updateAttr label label-success" data-l1key="status"></span><br/>';
    if (isset(_update.configuration) && isset(_update.configuration.version)) {
        tr += ' <span class="label label-info">' + _update.configuration.version + '</span>';
    }
    tr += '</td>';
    tr += '<td>';
    tr += '<input type="checkbox" class="updateAttr" data-l1key="configuration" data-l2key="doNotUpdate">{{Ne pas mettre à jour}}<br/>';
    if (_update.status == 'update') {
        tr += '<a class="btn btn-info btn-xs update tooltips" style="margin-bottom : 5px;" title="{{Mettre à jour}}"><i class="fa fa-refresh"></i> {{Mettre à jour}}</a> ';
    }else if (_update.type != 'core') {
        tr += '<a class="btn btn-info btn-xs update tooltips" style="margin-bottom : 5px;" title="{{Re-installer}}"><i class="fa fa-refresh"></i> {{Re-installer}}</a> ';
    }
    if (_update.type != 'core') {
        if (isset(_update.info) && isset(_update.info.changelog) && _update.info.changelog != '') {
            tr += '<a class="btn btn-default btn-xs tooltips cursor" target="_blank" href="'+_update.info.changelog+'" style="margin-bottom : 5px;"><i class="fa fa-book"></i> {{Changelog}}</a>';
        }
    }else{
     tr += '<a class="btn btn-default btn-xs" href="https://jeedom.com/roadmap/index.php?changelog" target="_blank" style="margin-bottom : 5px;"><i class="fa fa-book"></i> {{Changelog}}</a>'; 
 }
 tr += '</td>';
 tr += '<td>';
 tr += '<a class="btn btn-info btn-xs pull-right checkUpdate expertModeVisible tooltips" style="margin-bottom : 5px;" ><i class="fa fa-check"></i> {{Vérifier les mises à jour}}</a>';
 if (_update.type != 'core') {
    tr += '<a class="btn btn-danger btn-xs pull-right remove expertModeVisible tooltips" style="margin-bottom : 5px;" ><i class="fa fa-trash-o"></i> {{Supprimer}}</a>';  
}

tr += '</td>';
tr += '</tr>';
$('#table_update').append(tr);
$('#table_update tbody tr:last').setValues(_update, '.updateAttr');
}

$('#bt_saveUpdate').on('click',function(){
    jeedom.update.saves({
        updates : $('#table_update tbody tr').getValues('.updateAttr'),
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (data) {
         $('#div_alert').showAlert({message: '{{Sauvegarde effectuée}}', level: 'success'});
         printUpdate();
     }
 });
});