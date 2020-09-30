# MMM-HH-LocalTransport

# Get API key

You need to obtain your API key here: https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/datenabruf
by sending Hochbahn a mail (link at the bottom of the page)

# Install

1. Clone repository into `../modules/` inside your MagicMirror folder.
2. Run `npm install` inside `../modules/MMM-HH-LocalTransport/` folder
3. Run `node findStation.js apiKey apiUser stationName` to find out your Station ID.
4. Add the module to the MagicMirror config
```
        {
            module: 'MMM-HH-LocalTransport',
            position: 'bottom_right',
            header: 'Connections',
            config: {
                id: '', // Trainstation ID
                apiKey: '', // Add your apiKey
                apiUser: '', // Add your apiUser
                maximumEntries: '10' // Max departures displayed
            }
        },
```
# Screenshot
![screenshot](https://cloud.githubusercontent.com/assets/6489464/16900320/11ec448a-4c22-11e6-8754-181862a52540.png)


# Further information
For all config options check [here](https://github.com/skuethe/MMM-HH-LocalTransport/blob/master/MMM-HH-LocalTransport.js#L15-L31).
