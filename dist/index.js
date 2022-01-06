"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const Database_1 = require("./Database");
const ModBusConnection_1 = require("./ModBusConnection");
(async () => {
    const INTERVAL = process.env.INTERVAL ? parseInt(process.env.INTERVAL) : 1000;
    const connOpts = {
        host: process.env.MODBUS_HOST,
        port: process.env.MODBUS_PORT ? parseInt(process.env.MODBUS_PORT) : 502
    };
    let modbusConn;
    try {
        modbusConn = await ModBusConnection_1.ModbusConnection.connect(connOpts);
    }
    catch (e) {
        console.error(`Couldn't connect to ${connOpts.host}:${connOpts.port}`);
        console.error(e);
        process.exit(1);
    }
    const db = Database_1.Database.connect({
        host: process.env.INFLUX_HOST,
        port: process.env.INFLUX_PORT ? parseInt(process.env.INFLUX_PORT) : 8086,
        db: process.env.INFLUX_DB,
        user: process.env.INFLUX_USER,
        password: process.env.INFLUX_PASSWORD,
        measurement: process.env.INFLUX_MEASUREMENT,
        fieldMap: Promise.resolve().then(() => __importStar(require(process.env.INFLUX_MAP_FILE ?? './influx_map.json')))
    }, process.env.INFLUX_METERTAG);
    setInterval(async () => {
        if (modbusConn && modbusConn.conn) {
            let data;
            try {
                const registers = await modbusConn.getRegisterRanges([
                    { startParam: 1, quantity: 40 },
                    { startParam: 41, quantity: 13 },
                    { startParam: 101, quantity: 34 },
                    { startParam: 168, quantity: 23 }
                ]);
                data = {
                    l1: {
                        V: registers.get16BitFloatVal(1),
                        A: registers.get16BitFloatVal(4),
                        W: registers.get16BitFloatVal(7),
                        VA: registers.get16BitFloatVal(10),
                        VAr: registers.get16BitFloatVal(13),
                        powerFactor: registers.get16BitFloatVal(16),
                        phaseAngle: registers.get16BitFloatVal(19),
                        total: {
                            import: {
                                kWh: registers.get16BitFloatVal(174),
                                kVArh: registers.get16BitFloatVal(183)
                            },
                            export: {
                                kWh: registers.get16BitFloatVal(177),
                                kVArh: registers.get16BitFloatVal(186)
                            },
                            kWh: registers.get16BitFloatVal(180),
                            kVArh: registers.get16BitFloatVal(189)
                        },
                        demand: {
                            A: registers.get16BitFloatVal(130),
                            maxA: registers.get16BitFloatVal(133)
                        },
                        THD: {
                            V: registers.get16BitFloatVal(118),
                            A: registers.get16BitFloatVal(121)
                        }
                    },
                    l2: {
                        V: registers.get16BitFloatVal(2),
                        A: registers.get16BitFloatVal(5),
                        W: registers.get16BitFloatVal(8),
                        VA: registers.get16BitFloatVal(11),
                        VAr: registers.get16BitFloatVal(14),
                        powerFactor: registers.get16BitFloatVal(17),
                        phaseAngle: registers.get16BitFloatVal(20),
                        total: {
                            import: {
                                kWh: registers.get16BitFloatVal(175),
                                kVArh: registers.get16BitFloatVal(184)
                            },
                            export: {
                                kWh: registers.get16BitFloatVal(178),
                                kVArh: registers.get16BitFloatVal(187)
                            },
                            kWh: registers.get16BitFloatVal(181),
                            kVArh: registers.get16BitFloatVal(190)
                        },
                        demand: {
                            A: registers.get16BitFloatVal(131),
                            maxA: registers.get16BitFloatVal(134)
                        },
                        THD: {
                            V: registers.get16BitFloatVal(119),
                            A: registers.get16BitFloatVal(122)
                        }
                    },
                    l3: {
                        V: registers.get16BitFloatVal(3),
                        A: registers.get16BitFloatVal(6),
                        W: registers.get16BitFloatVal(9),
                        VA: registers.get16BitFloatVal(12),
                        VAr: registers.get16BitFloatVal(15),
                        powerFactor: registers.get16BitFloatVal(18),
                        phaseAngle: registers.get16BitFloatVal(21),
                        total: {
                            import: {
                                kWh: registers.get16BitFloatVal(176),
                                kVArh: registers.get16BitFloatVal(185)
                            },
                            export: {
                                kWh: registers.get16BitFloatVal(179),
                                kVArh: registers.get16BitFloatVal(188)
                            },
                            kWh: registers.get16BitFloatVal(182),
                            kVArh: registers.get16BitFloatVal(191)
                        },
                        demand: {
                            A: registers.get16BitFloatVal(132),
                            maxA: registers.get16BitFloatVal(135)
                        },
                        THD: {
                            V: registers.get16BitFloatVal(120),
                            A: registers.get16BitFloatVal(123)
                        }
                    },
                    line2Line: {
                        l1toL2: {
                            THD: {
                                V: registers.get16BitFloatVal(168)
                            }
                        },
                        l2toL3: {
                            THD: {
                                V: registers.get16BitFloatVal(169)
                            }
                        },
                        l3toL1: {
                            THD: {
                                V: registers.get16BitFloatVal(170)
                            }
                        }
                    },
                    total: {
                        A: registers.get16BitFloatVal(25),
                        W: registers.get16BitFloatVal(27),
                        VA: registers.get16BitFloatVal(29),
                        VAr: registers.get16BitFloatVal(31),
                        powerFactor: registers.get16BitFloatVal(32),
                        phaseAngle: registers.get16BitFloatVal(34),
                        import: {
                            kWh: registers.get16BitFloatVal(37),
                            kVArh: registers.get16BitFloatVal(39)
                        },
                        export: {
                            kWh: registers.get16BitFloatVal(38),
                            kVArh: registers.get16BitFloatVal(40)
                        },
                        kWh: registers.get16BitFloatVal(172),
                        kVArh: registers.get16BitFloatVal(173),
                        kVAh: registers.get16BitFloatVal(41),
                        Ah: registers.get16BitFloatVal(42),
                        demand: {
                            W: registers.get16BitFloatVal(43),
                            maxW: registers.get16BitFloatVal(44),
                            VA: registers.get16BitFloatVal(51),
                            maxVA: registers.get16BitFloatVal(52)
                        }
                    },
                    average: {
                        V: registers.get16BitFloatVal(22),
                        A: registers.get16BitFloatVal(24),
                        line2Line: {
                            V: registers.get16BitFloatVal(104),
                            THD: {
                                V: registers.get16BitFloatVal(171)
                            }
                        },
                        THD: {
                            V: registers.get16BitFloatVal(125)
                        }
                    },
                    neutral: {
                        A: registers.get16BitFloatVal(113),
                        demand: {
                            A: registers.get16BitFloatVal(53),
                            maxA: registers.get16BitFloatVal(54)
                        }
                    },
                    frequency: registers.get16BitFloatVal(36)
                };
                console.log(`Data written`);
            }
            catch (e) {
                console.error(`Retrieving registers failed:`);
                console.error(e);
            }
            if (data) {
                try {
                    await db.write(data);
                    console.log(`Data written`);
                }
                catch (e) {
                    console.error(`Writing data to influx failed:`);
                    console.error(e);
                }
            }
        }
        else {
            console.error(`No connection anymore with ${connOpts.host}:${connOpts.port}`);
            process.exit(1);
        }
    }, INTERVAL);
})();
//# sourceMappingURL=index.js.map