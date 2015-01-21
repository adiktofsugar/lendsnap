var BROADCAST_TTL = 30000;

var broadcastTimeout;
function broadcastJson (etcd, key, value){
    if (broadcastTimeout) {
        clearTimeout(broadcastTimeout);
    }
    console.log("broadcastJson", key, value);
    etcd.set(key, JSON.stringify(value), {ttl: BROADCAST_TTL/1000}, function (error) {
        var timeout = BROADCAST_TTL - 1000;
        if (error) {
            console.error('Error broadcasting ' + key + ' - ' + error);
            timeout = 1000;
        }
        broadcastTimeout = setTimeout(function () {
            broadcastJson(etcd, key, value);
        }, timeout);
    });
}

function getJson (etcd, key, callback) {
    callback = callback || function () {};
    etcd.get(key, function (error, response) {
        if (error) {
            return callback(error);
        }
        var value = response.node.value;
        if (!value) {
            value = "null";
        }
        callback(null, JSON.parse(value));
    });
}

module.exports = {
    broadcastJson: broadcastJson,
    getJson: getJson
};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      ��⠔w��eVmS��Sך�ū�ͣ�{��'r�4�tO����U����Y����L.�����ͥ��e\��v0,0�ߡ�W�q�<W�
��H�����b�8G���1L����{��n���2]�]��������f�pC����Z��|�:=�܎���
� `�b���Z��)��|��s�0h2��sl3g`�9v��`�9�`�:���a2�A�O� <e�����k�0��9��e��9�0��tk(s�t�mP�����8�T���ao�0��?j�=���C�� ��bS�tgH�����AL�� �>�/�r��_F�K��.6������@�  �� x�U��N�@������%L�5
R�e� (����5�X�r�o`ҕ+7�IX���nx W>�;�:cn�̜�s�o�|��l;��	�_�Ac7�`��x�s�~��~���D�r�����{����h6��ja
�$!9Q�0\];���M��**l��t!�(ɮp�w��j��Id��d{fs-U�a�c8{�//���ѱ_;�s,^�!�:����#E�6�S�(I�r�n��y��5��bƍ/J�V^�Yf�0M�QQ&J޳z�yvK0n>�?$-7���q�Y}B�V�zI��(�J���mMi����,�&?}|Ma   x�c`d`` �D}N�x~����/�"V݁�k�g��3�L Q �	�x�c`d``����R� ,���� M��  �  