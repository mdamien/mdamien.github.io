//scrap notes
//uv web listing
notes = []
$('table tr').each(function(i, tr){
    $tr = $(tr);
    var uv = tr.getAttribute('uv-name');
    if(uv != null){
        var note = tr.getElementsByTagName('td')[2].innerHTML;
        notes.push({
            uv:uv,
            note:note,
        })
    }
})
console.log(JSON.stringify(notes))

//scrap uvs
//https://demeter.utc.fr/pls/portal30/ENSEIGNEMENT.CONSULT_ENSEG_TAB_DYN.show

//scrap schedule
//UVS = [uv['name'] for uv in json.load(open('data/uvs_rentree.json'))]
UVS = ['APJE', 'AP51', 'AP52', 'AP53', 'AR03', 'AR04', 'AS01', 'AV01', 'BA03', 'BA04', 'BA05', 'BA06', 'TD01', 'BL01', 'BL10', 'BL16', 'BL17', 'XL20', 'BL20', 'BM04', 'BM05', 'BM06', 'BM07', 'BT03', 'BT07', 'BT09', 'C2I1', 'CM04', 'CM05', 'CM06', 'CM07', 'TD11', 'CM11', 'CM12', 'TD13', 'CM13', 'CX01', 'CX02', 'DI01', 'DI02', 'DI05', 'HI05', 'DI07', 'DI08', 'EG01', 'EI03', 'EI04', 'EI05', 'XN21', 'EN21', 'EN90', 'EV02', 'FQ01', 'FQ03', 'FQ04', 'FQ05', 'FM00', 'FR00', 'HT00', 'GE10', 'GE12', 'GE13', 'GE15', 'GE20', 'GE21', 'GE22', 'GE23', 'GE25', 'GE26', 'GE27', 'GE28', 'GE29', 'GE36', 'GE37', 'GE38', 'GE39', 'GE40', 'HE01', 'HE03', 'HT01', 'HT04', 'IA01', 'IA03', 'IC03', 'IC05', 'IC07', 'IS01', 'IS02', 'LA00', 'LA01', 'LA02', 'LA03', 'LA04', 'LB04', 'LA11', 'LA12', 'LA13', 'LA14', 'LB14', 'LC14', 'LA15', 'LC72', 'LC73', 'LA20', 'LA21', 'LA22', 'LA23', 'LA24', 'LB24', 'LG30', 'LG31', 'LG32', 'LG40', 'LG41', 'LG42', 'LG50', 'LG51', 'LG52', 'LG53', 'LG60', 'LG61', 'LG62', 'LG63', 'LA91', 'LA92', 'LA93', 'LA94', 'LO01', 'LO23', 'MA11', 'MB11', 'MC02', 'MC06', 'MC08', 'MEQ1', 'MI01', 'MP03', 'XQ01', 'MQ01', 'XQ03', 'MQ03', 'MQ05', 'MQ06', 'MQ07', 'MQ12', 'MQ13', 'MQ16', 'XQ17', 'MQ17', 'MQ20', 'MS01', 'MS03', 'MT09', 'MT12', 'MT22', 'MT23', 'MT31', 'MT33', 'MT36', 'MX03', 'MX04', 'MX05', 'NF01', 'NF02', 'NF04', 'NF16', 'NP16', 'NA17', 'NF22'
, 'NF29', 'NF92', 'NF93', 'PH01', 'PH02', 'PH03', 'PH09', 'PH10', 'PH11', 'TD04', 'PS04', 'PS10', 'PS12', 'PS13', 'PS15', 'PS90', 'PS91', 'TD93', 'PS93', 'PS95', 'RO05', 'RO06', 'RR02', 'RV01', 'SA11', 'SC11', 'SC12', 'SC21', 'SC24', 'SF00', 'SI01', 'SI02', 'SI05', 'SI06', 'SI07', 'SI11', 'SI14', 'SI20', 'SI22', 'SI24', 'SI28', 'SO04', 'SO05', 'SO06', 'SP01', 'SP22', 'SR01', 'SR04', 'SR05', 'SR06', 'SY01', 'SY02', 'SY03', 'SY08', 'SY10', 'SY16', 'SY19', 'SY27', 'SY31', 'TB01', 'TF01', 'TF11', 'TF15', 'TH02', 'TH04', 'TN01', 'TN02', 'TD03', 'TN03', 'TN04', 'TD06', 'TN06', 'TN08', 'TN12', 'TN14', 'TN20', 'TN21', 'TN22', 'TN23', 'TO01', 'TS02', 'TR91', 'UB01', 'UB10', 'UR02', 'UR03', 'UR04', 'MU01', 'MU03', 'TX00', 'PR00', 'PRDW', 'TN15', 'SPJE']
//UVS = ['MT22', 'MT23']
template = 'http://wwwetu.utc.fr/rentree_cgi_bin/edt.cgi?bedt=Hor&salles=avec+salles&jour=semaine&u11={uv}&u12=_%3F_UV+&u13=_%3F_UV+&u14=_%3F_UV+&u15=_%3F_UV+&u16=_%3F_UV+&u17=_%3F_UV+&u21=_%3F_R1+&u22=_%3F_R1+&u23=_%3F_R1+&u24=_%3F_R1+&u25=_%3F_R1+&u26=_%3F_R1+&u27=_%3F_R1+&u31=_%3F_R2+&u32=_%3F_R2+&u33=_%3F_R2+&u34=_%3F_R2+&u35=_%3F_R2+&u36=_%3F_R2+&u37=_%3F_R2+&u41=_%3F_SPJ+'
DATA = ""
c = 0
UVS.forEach(function(uv){
    url = template.replace('{uv}', uv)
    console.log('let\'s get '+uv)
    $.get(url, function(data){
        c += 1
        console.log('..'+uv+" ok "+c+'/'+UVS.length)
        DATA += '%---------------%\n\n'
        DATA += data
    })
})
console.log('ship launched')
