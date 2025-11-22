# FIX Message Web Component

This is a web component for displaying FIX (Financial Information eXchange) messages. It can render a FIX message as either a simple delimited string or a detailed, human-readable table.

The component parses FIX messages and enriches them with data from a FIX dictionary, providing tag names, value descriptions, and other useful information.

### Key Features:

*   **Two Display Modes**: View FIX messages as a raw string with custom delimiters or as a comprehensive HTML table.
*   **FIX Dictionary Support**: Automatically uses the appropriate FIX dictionary based on the message version. It supports FIX versions 4.0 through 5.0 SP2.
*   **Customizable**: Control the appearance and parsing with attributes like `message`, `delimiter`, and `mode`.
*   **Intelligent Version Detection**: Automatically detects the data dictionary version from the message content when using FIXT 1.1.
*   **Color-Coded Data Types**: The table view uses different colors for various data types (string, integer, float, etc.) to improve readability.

## Usage

To use the `fix-message` component, you need to include the `fix-message.mjs` script in your HTML file and then use the `<fix-message>` tag.

```html
<!DOCTYPE html>
<html>
<head>
    <title>FIX Message Viewer</title>
    <script type="module" src="fix-message.mjs"></script>
</head>
<body>

    <h1>FIX Message Display</h1>

    <fix-message
        message="8=FIX.4.2|9=123|35=D|49=SENDER|56=TARGET|34=1|52=20231120-14:30:00.000|11=ORDER1|21=1|38=100|40=2|54=1|55=EUR/USD|59=0|60=20231120-14:30:00.000|10=168"
        mode="table"
        delimiter="|"
    ></fix-message>

</body>
</html>
```

### Attributes

*   `message`: The FIX message string to be displayed. The default delimiter is the SOH character (ASCII 1).
*   `delimiter`: The delimiter used in the `message` string. The default is `|`.
*   `mode`: The display mode. Can be `table` (default) or `string`.
*   `data-dictionary`: (Optional) The path to a custom data dictionary XML file. If not provided, the component will use the built-in dictionaries based on the message's `BeginString(8)` value.
*   `use-host-dom`: (Optional) If present, the component will render directly into the host element's DOM instead of its shadow DOM. This is useful for applying global styles.
