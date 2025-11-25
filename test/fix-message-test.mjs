import FixMessageHTMLElement from "../src/fix-message.mjs";

QUnit.test('init', (assert) => {
    const element = document.createElement('fix-message');
    assert.ok(element);
});

QUnit.test('loadModel', async (assert) => {
    const done = assert.async();
    const element = document.createElement('fix-message');
    element.message = '8=FIX.4.49=7535=A34=109249=TESTBUY152=20180920-18:24:59.64356=TESTSELL198=0108=6010=178';
    let model = await element.loadModel();
    assert.deepEqual(model, {
        "header": [
            {
                "name": "BeginString",
                "number": "8",
                "type": "STRING",
                "value": "FIX.4.4",
                "values": {}
            },
            {
                "name": "BodyLength",
                "number": "9",
                "type": "LENGTH",
                "value": "75",
                "values": {}
            },
            {
                "name": "MsgType",
                "number": "35",
                "type": "STRING",
                "value": "A",
                "values": {
                    "0": "HEARTBEAT",
                    "1": "TEST_REQUEST",
                    "2": "RESEND_REQUEST",
                    "3": "REJECT",
                    "4": "SEQUENCE_RESET",
                    "5": "LOGOUT",
                    "6": "INDICATION_OF_INTEREST",
                    "7": "ADVERTISEMENT",
                    "8": "EXECUTION_REPORT",
                    "9": "ORDER_CANCEL_REJECT",
                    "A": "LOGON",
                    "AA": "DERIVATIVE_SECURITY_LIST",
                    "AB": "NEW_ORDER_MULTILEG",
                    "AC": "MULTILEG_ORDER_CANCEL_REPLACE",
                    "AD": "TRADE_CAPTURE_REPORT_REQUEST",
                    "AE": "TRADE_CAPTURE_REPORT",
                    "AF": "ORDER_MASS_STATUS_REQUEST",
                    "AG": "QUOTE_REQUEST_REJECT",
                    "AH": "RFQ_REQUEST",
                    "AI": "QUOTE_STATUS_REPORT",
                    "AJ": "QUOTE_RESPONSE",
                    "AK": "CONFIRMATION",
                    "AL": "POSITION_MAINTENANCE_REQUEST",
                    "AM": "POSITION_MAINTENANCE_REPORT",
                    "AN": "REQUEST_FOR_POSITIONS",
                    "AO": "REQUEST_FOR_POSITIONS_ACK",
                    "AP": "POSITION_REPORT",
                    "AQ": "TRADE_CAPTURE_REPORT_REQUEST_ACK",
                    "AR": "TRADE_CAPTURE_REPORT_ACK",
                    "AS": "ALLOCATION_REPORT",
                    "AT": "ALLOCATION_REPORT_ACK",
                    "AU": "CONFIRMATION_ACK",
                    "AV": "SETTLEMENT_INSTRUCTION_REQUEST",
                    "AW": "ASSIGNMENT_REPORT",
                    "AX": "COLLATERAL_REQUEST",
                    "AY": "COLLATERAL_ASSIGNMENT",
                    "AZ": "COLLATERAL_RESPONSE",
                    "B": "NEWS",
                    "BA": "COLLATERAL_REPORT",
                    "BB": "COLLATERAL_INQUIRY",
                    "BC": "NETWORK_STATUS_REQUEST",
                    "BD": "NETWORK_STATUS_RESPONSE",
                    "BE": "USER_REQUEST",
                    "BF": "USER_RESPONSE",
                    "BG": "COLLATERAL_INQUIRY_ACK",
                    "BH": "CONFIRMATION_REQUEST",
                    "C": "EMAIL",
                    "D": "ORDER_SINGLE",
                    "E": "ORDER_LIST",
                    "F": "ORDER_CANCEL_REQUEST",
                    "G": "ORDER_CANCEL_REPLACE_REQUEST",
                    "H": "ORDER_STATUS_REQUEST",
                    "J": "ALLOCATION_INSTRUCTION",
                    "K": "LIST_CANCEL_REQUEST",
                    "L": "LIST_EXECUTE",
                    "M": "LIST_STATUS_REQUEST",
                    "N": "LIST_STATUS",
                    "P": "ALLOCATION_INSTRUCTION_ACK",
                    "Q": "DONT_KNOW_TRADE",
                    "R": "QUOTE_REQUEST",
                    "S": "QUOTE",
                    "T": "SETTLEMENT_INSTRUCTIONS",
                    "V": "MARKET_DATA_REQUEST",
                    "W": "MARKET_DATA_SNAPSHOT_FULL_REFRESH",
                    "X": "MARKET_DATA_INCREMENTAL_REFRESH",
                    "Y": "MARKET_DATA_REQUEST_REJECT",
                    "Z": "QUOTE_CANCEL",
                    "a": "QUOTE_STATUS_REQUEST",
                    "b": "MASS_QUOTE_ACKNOWLEDGEMENT",
                    "c": "SECURITY_DEFINITION_REQUEST",
                    "d": "SECURITY_DEFINITION",
                    "e": "SECURITY_STATUS_REQUEST",
                    "f": "SECURITY_STATUS",
                    "g": "TRADING_SESSION_STATUS_REQUEST",
                    "h": "TRADING_SESSION_STATUS",
                    "i": "MASS_QUOTE",
                    "j": "BUSINESS_MESSAGE_REJECT",
                    "k": "BID_REQUEST",
                    "l": "BID_RESPONSE",
                    "m": "LIST_STRIKE_PRICE",
                    "n": "XML_MESSAGE",
                    "o": "REGISTRATION_INSTRUCTIONS",
                    "p": "REGISTRATION_INSTRUCTIONS_RESPONSE",
                    "q": "ORDER_MASS_CANCEL_REQUEST",
                    "r": "ORDER_MASS_CANCEL_REPORT",
                    "s": "NEW_ORDER_CROSS",
                    "t": "CROSS_ORDER_CANCEL_REPLACE_REQUEST",
                    "u": "CROSS_ORDER_CANCEL_REQUEST",
                    "v": "SECURITY_TYPE_REQUEST",
                    "w": "SECURITY_TYPES",
                    "x": "SECURITY_LIST_REQUEST",
                    "y": "SECURITY_LIST",
                    "z": "DERIVATIVE_SECURITY_LIST_REQUEST"
                }
            },
            {
                "name": "MsgSeqNum",
                "number": "34",
                "type": "SEQNUM",
                "value": "1092",
                "values": {}
            },
            {
                "name": "SenderCompID",
                "number": "49",
                "type": "STRING",
                "value": "TESTBUY1",
                "values": {}
            },
            {
                "name": "SendingTime",
                "number": "52",
                "type": "UTCTIMESTAMP",
                "value": "20180920-18:24:59.643",
                "values": {}
            },
            {
                "name": "TargetCompID",
                "number": "56",
                "type": "STRING",
                "value": "TESTSELL1",
                "values": {}
            }
        ],
        "message": [
            {
                "name": "EncryptMethod",
                "number": "98",
                "type": "INT",
                "value": "0",
                "values": {
                    "0": "NONE_OTHER",
                    "1": "PKCS",
                    "2": "DES",
                    "3": "PKCS_DES",
                    "4": "PGP_DES",
                    "5": "PGP_DES_MD5",
                    "6": "PEM_DES_MD5"
                }
            },
            {
                "name": "HeartBtInt",
                "number": "108",
                "type": "INT",
                "value": "60",
                "values": {}
            }
        ],
        "trailer": [
            {
                "name": "CheckSum",
                "number": "10",
                "type": "STRING",
                "value": "178",
                "values": {}
            }
        ]
    });
    done();
});

QUnit.test('loadModelGroups', async (assert) => {
    const done = assert.async();
    const element = document.createElement('fix-message');
    element.message = '8=FIX.4.4|9=288|35=W|34=6005|49=APHELION_EFX|52=20231027-14:30:05.150|56=CLIENT_APP|262=MDReq_EURUSD|55=EUR/USD|268=2|269=0|270=1.0550|271=1000000|299=Tier1|117=QID_BID_01|269=1|270=1.0552|271=1000000|299=Tier1|117=QID_OFFER_01|10=158|';
    let model = await element.loadModel();
    assert.deepEqual(model.message,
        [
            {
                "name": "MDReqID",
                "number": "262",
                "type": "STRING",
                "value": "MDReq_EURUSD",
                "values": {}
            },
            {
                "name": "Symbol",
                "number": "55",
                "type": "STRING",
                "value": "EUR/USD",
                "values": {}
            },
            {
                "name": "NoMDEntries",
                "number": "268",
                "type": "NUMINGROUP",
                "value": "2",
                "values": {},
                "groups": [[
                    {
                        "name": "MDEntryType",
                        "number": "269",
                        "type": "CHAR",
                        "value": "0",
                        "values": {
                            "0": "BID",
                            "1": "OFFER",
                            "2": "TRADE",
                            "3": "INDEX_VALUE",
                            "4": "OPENING_PRICE",
                            "5": "CLOSING_PRICE",
                            "6": "SETTLEMENT_PRICE",
                            "7": "TRADING_SESSION_HIGH_PRICE",
                            "8": "TRADING_SESSION_LOW_PRICE",
                            "9": "TRADING_SESSION_VWAP_PRICE",
                            "A": "IMBALANCE",
                            "B": "TRADE_VOLUME",
                            "C": "OPEN_INTEREST"
                        }
                    },
                    {
                        "name": "MDEntryPx",
                        "number": "270",
                        "type": "PRICE",
                        "value": "1.0550",
                        "values": {}
                    },
                    {
                        "name": "MDEntrySize",
                        "number": "271",
                        "type": "QTY",
                        "value": "1000000",
                        "values": {}
                    },
                    {
                        "name": "QuoteEntryID",
                        "number": "299",
                        "type": "STRING",
                        "value": "Tier1",
                        "values": {}
                    },
                    {
                        "name": "QuoteID",
                        "number": "117",
                        "type": "STRING",
                        "value": "QID_BID_01",
                        "values": {}
                    }
                ], [
                    {
                        "name": "MDEntryType",
                        "number": "269",
                        "type": "CHAR",
                        "value": "1",
                        "values": {
                            "0": "BID",
                            "1": "OFFER",
                            "2": "TRADE",
                            "3": "INDEX_VALUE",
                            "4": "OPENING_PRICE",
                            "5": "CLOSING_PRICE",
                            "6": "SETTLEMENT_PRICE",
                            "7": "TRADING_SESSION_HIGH_PRICE",
                            "8": "TRADING_SESSION_LOW_PRICE",
                            "9": "TRADING_SESSION_VWAP_PRICE",
                            "A": "IMBALANCE",
                            "B": "TRADE_VOLUME",
                            "C": "OPEN_INTEREST"
                        }
                    },
                    {
                        "name": "MDEntryPx",
                        "number": "270",
                        "type": "PRICE",
                        "value": "1.0552",
                        "values": {}
                    },
                    {
                        "name": "MDEntrySize",
                        "number": "271",
                        "type": "QTY",
                        "value": "1000000",
                        "values": {}
                    },
                    {
                        "name": "QuoteEntryID",
                        "number": "299",
                        "type": "STRING",
                        "value": "Tier1",
                        "values": {}
                    },
                    {
                        "name": "QuoteID",
                        "number": "117",
                        "type": "STRING",
                        "value": "QID_OFFER_01",
                        "values": {}
                    }
                ]]
            }
        ]);
    done();
});
