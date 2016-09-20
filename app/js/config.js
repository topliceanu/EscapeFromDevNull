config = {};


config.limits = {};
config.limits.QPS = 20; // queries per second.
config.limits.CQPS = 4; // character queries per second.


config.api = {};
config.api.key = '6fa07022-ed02-4ef8-9ba8-66d70ea65927'; // api key.
//config.api.key = 'e90560d9-313b-4c4e-be97-ca60ff0ce6fa'; // test key

config.api.baseUrl = 'https://generiwittcism.com:8000/api3/?session='+config.api.key; // base url for all commands.


config.ent = {}; // constants for map entities.
config.ent.NOTHING     = 0x00000000;
config.ent.BLOCKED     = 0x00000001;
config.ent.ROOM        = 0x00000002;
config.ent.CORRIDOR    = 0x00000004;
config.ent.PERIMETER   = 0x00000010;
config.ent.ENTRANCE    = 0x00000020;
config.ent.ROOM_ID     = 0x0000FFC0;
config.ent.ARCH        = 0x00010000;
config.ent.DOOR        = 0x00020000;
config.ent.DOOR        = 0x00040000;
config.ent.DOOR        = 0x00080000;
config.ent.DOOR        = 0x00100000;
config.ent.PORTCULLIS  = 0x00200000;
config.ent.STAIR_DOWN  = 0x00400000;
config.ent.STAIR_UP    = 0x00800000;
config.ent.LABEL       = 0xFF000000;
config.ent.FORGE       = 0x02000000;

























