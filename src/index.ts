import 'source-map-support/register';
import { Database } from './Database';
import { ModbusConnection } from './ModBusConnection';
import type { SDM630Registers } from './SDM630RegistersType';
import path from 'path';
import fs from 'fs/promises';
import Express from 'express';

(async () => {
  let data: SDM630Registers;

  // Set refresh interval
  const INTERVAL = process.env.INTERVAL ? parseInt(process.env.INTERVAL) : 1000;

  // Configure connection
  const modbusConnOpts = {
    host: process.env.MODBUS_HOST,
    port: process.env.MODBUS_PORT ? parseInt(process.env.MODBUS_PORT) : 502,
    slaveId: process.env.MODBUS_ADDRESS ? parseInt(process.env.MODBUS_ADDRESS) : 1
  };

  // Configure webserver
  if (process.env.HTTP_PORT) {
    const HTTP_PORT = parseInt(process.env.HTTP_PORT);
    const express = Express();

    express.get('/data', (_req, res) => {
      res.send(data);
    });

    express.listen(HTTP_PORT, () => {
      console.log(`HTTP listening on port ${HTTP_PORT}`);
    });
  }

  // Read Balanced kWh Totals
  const BALANCED_KWH_TOTALS_FILE = path.normalize(process.env.BALANCED_KWH_TOTALS_FILE ?? '/energymonitor/balancedKwhTotals.json');
  const balancedKwhTotals = {
    import: 0,
    export: 0
  };
  try {
    // Read file
    const fileContents = await fs.readFile(BALANCED_KWH_TOTALS_FILE, 'utf-8');
    const json = JSON.parse(fileContents);

    // Extract data
    balancedKwhTotals.import = json.import;
    balancedKwhTotals.export = json.export;
  } catch (e) {}

  // Write Balanced kWh Totals every minute
  setInterval(async () => {
    await fs.writeFile(BALANCED_KWH_TOTALS_FILE, JSON.stringify(balancedKwhTotals));
    console.log(`Saved Balanced Kwh Totals`);
  }, 60000);

  // Connect to modbus
  let modbusConn: ModbusConnection;
  try {
    modbusConn = await ModbusConnection.connect(modbusConnOpts);
  } catch (e) {
    console.error(`Couldn't connect to ${modbusConnOpts.host}:${modbusConnOpts.port}`);
    console.error(e);
    process.exit(1);
  }

  // Connect to Influx
  const INFLUX_MAP_FILE = path.normalize(process.env.INFLUX_MAP_FILE ?? './src/influx_map.json');
  const influxConnOpts = {
    url: process.env.INFLUX_URL,
    bucket: process.env.INFLUX_BUCKET,
    org: process.env.INFLUX_ORG,
    token: process.env.INFLUX_TOKEN,
    measurement: process.env.INFLUX_MEASUREMENT,
    fieldMap: JSON.parse((await fs.readFile(INFLUX_MAP_FILE, 'utf-8')).toString())
  };
  const db = Database.connect(influxConnOpts, process.env.INFLUX_METERTAG);

  // Read registers every second
  setInterval(async () => {
    if (modbusConn && modbusConn.isConnected) {
      // Get data
      try {
        // Retrieve vals (max 40 per trip = 80 registers)
        const registers = await modbusConn.getRegisterRanges([
          { startParam: 1, quantity: 40 },
          { startParam: 41, quantity: 13 },
          { startParam: 101, quantity: 34 },
          { startParam: 168, quantity: 23 }
        ]);

        // Extract data
        data = {
          l1: {
            V: registers.get32BitFloatVal(1),
            A: registers.get32BitFloatVal(4),
            W: registers.get32BitFloatVal(7),
            VA: registers.get32BitFloatVal(10),
            VAr: registers.get32BitFloatVal(13),
            powerFactor: registers.get32BitFloatVal(16),
            phaseAngle: registers.get32BitFloatVal(19),
            total: {
              import: {
                kWh: registers.get32BitFloatVal(174),
                kVArh: registers.get32BitFloatVal(183)
              },
              export: {
                kWh: registers.get32BitFloatVal(177),
                kVArh: registers.get32BitFloatVal(186)
              },
              kWh: registers.get32BitFloatVal(180),
              kVArh: registers.get32BitFloatVal(189)
            },
            demand: {
              A: registers.get32BitFloatVal(130),
              maxA: registers.get32BitFloatVal(133)
            },
            THD: {
              V: registers.get32BitFloatVal(118),
              A: registers.get32BitFloatVal(121)
            }
          },
          l2: {
            V: registers.get32BitFloatVal(2),
            A: registers.get32BitFloatVal(5),
            W: registers.get32BitFloatVal(8),
            VA: registers.get32BitFloatVal(11),
            VAr: registers.get32BitFloatVal(14),
            powerFactor: registers.get32BitFloatVal(17),
            phaseAngle: registers.get32BitFloatVal(20),
            total: {
              import: {
                kWh: registers.get32BitFloatVal(175),
                kVArh: registers.get32BitFloatVal(184)
              },
              export: {
                kWh: registers.get32BitFloatVal(178),
                kVArh: registers.get32BitFloatVal(187)
              },
              kWh: registers.get32BitFloatVal(181),
              kVArh: registers.get32BitFloatVal(190)
            },
            demand: {
              A: registers.get32BitFloatVal(131),
              maxA: registers.get32BitFloatVal(134)
            },
            THD: {
              V: registers.get32BitFloatVal(119),
              A: registers.get32BitFloatVal(122)
            }
          },
          l3: {
            V: registers.get32BitFloatVal(3),
            A: registers.get32BitFloatVal(6),
            W: registers.get32BitFloatVal(9),
            VA: registers.get32BitFloatVal(12),
            VAr: registers.get32BitFloatVal(15),
            powerFactor: registers.get32BitFloatVal(18),
            phaseAngle: registers.get32BitFloatVal(21),
            total: {
              import: {
                kWh: registers.get32BitFloatVal(176),
                kVArh: registers.get32BitFloatVal(185)
              },
              export: {
                kWh: registers.get32BitFloatVal(179),
                kVArh: registers.get32BitFloatVal(188)
              },
              kWh: registers.get32BitFloatVal(182),
              kVArh: registers.get32BitFloatVal(191)
            },
            demand: {
              A: registers.get32BitFloatVal(132),
              maxA: registers.get32BitFloatVal(135)
            },
            THD: {
              V: registers.get32BitFloatVal(120),
              A: registers.get32BitFloatVal(123)
            }
          },
          line2Line: {
            l1toL2: {
              THD: {
                V: registers.get32BitFloatVal(168)
              }
            },
            l2toL3: {
              THD: {
                V: registers.get32BitFloatVal(169)
              }
            },
            l3toL1: {
              THD: {
                V: registers.get32BitFloatVal(170)
              }
            }
          },
          total: {
            A: registers.get32BitFloatVal(25),
            W: registers.get32BitFloatVal(27),
            VA: registers.get32BitFloatVal(29),
            VAr: registers.get32BitFloatVal(31),
            powerFactor: registers.get32BitFloatVal(32),
            phaseAngle: registers.get32BitFloatVal(34),
            import: {
              kWh: registers.get32BitFloatVal(37),
              kVArh: registers.get32BitFloatVal(39)
            },
            export: {
              kWh: registers.get32BitFloatVal(38),
              kVArh: registers.get32BitFloatVal(40)
            },
            kWh: registers.get32BitFloatVal(172),
            kVArh: registers.get32BitFloatVal(173),
            kVAh: registers.get32BitFloatVal(41),
            Ah: registers.get32BitFloatVal(42),
            demand: {
              W: registers.get32BitFloatVal(43),
              maxW: registers.get32BitFloatVal(44),
              VA: registers.get32BitFloatVal(51),
              maxVA: registers.get32BitFloatVal(52)
            }
          },
          average: {
            V: registers.get32BitFloatVal(22),
            A: registers.get32BitFloatVal(24),
            line2Line: {
              V: registers.get32BitFloatVal(104),
              THD: {
                V: registers.get32BitFloatVal(171)
              }
            },
            THD: {
              V: registers.get32BitFloatVal(125)
            }
          },
          neutral: {
            A: registers.get32BitFloatVal(113),
            demand: {
              A: registers.get32BitFloatVal(53),
              maxA: registers.get32BitFloatVal(54)
            }
          },
          frequency: registers.get32BitFloatVal(36)
        };

        // Calculate Balanced Total Kwh (Belgian meter calc)
        const balancedKwh = data.total.W / 1000 / (3600000 / INTERVAL);
        if (balancedKwh >= 0) {
          balancedKwhTotals.import += balancedKwh;
        } else {
          balancedKwhTotals.export += Math.abs(balancedKwh);
        }
        // Add tot data list
        data.total.import.balancedKwh = balancedKwhTotals.import;
        data.total.export.balancedKwh = balancedKwhTotals.export;
      } catch (e) {
        console.error(`Retrieving registers failed:`);
        console.error(e);
        process.exit(1); // Force quit / restart
      }

      // Write data
      if (data) {
        try {
          await db.write(data);

          console.log(`Data written to InfluxDB`);
        } catch (e) {
          console.error(`Writing data to InfluxDB (${influxConnOpts.url}) failed:`);
          console.error(e);
          process.exit(1); // Force quit / restart
        }
      }
    } else {
      console.error(`No connection anymore with ${modbusConnOpts.host}:${modbusConnOpts.port}.`);
      console.error(`Exiting the app. Make sure the container always restarts by itself.`);
      process.exit(1); // Force quit / restart
    }
  }, INTERVAL);
})();
