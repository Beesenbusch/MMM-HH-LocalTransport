# MMM-HH-LocalTransport

# Get API key

You need to obtain your API key by sending Hochbahn an email.
Visit https://www.hvv.de/de/fahrplaene/abruf-fahrplaninfos/datenabruf and see the information at the bottom of the page.

# Install

1. Clone repository
```
cd modules
git clone https://github.com/skuethe/MMM-HH-LocalTransport.git
```
2. Install dependencies
```
cd MMM-HH-LocalTransport/
npm install
```
3. Find your specific Station ID by running `node findStation.js apiKey apiUser stationName`
4. Add the module to your MagicMirror config
```
        {
            module: 'MMM-HH-LocalTransport',
            position: 'bottom_right',
            header: 'HVV - Connections',
            config: {
                id: '', // Trainstation ID
                apiKey: '', // Add your apiKey
                apiUser: '', // Add your apiUser
                serviceTypes: ['ZUG', 'BUS', 'FAEHRE'], // Limit the service types that you want to display. Available types can be viewed in the MMM-HH-LocalTransport.js
                maximumEntries: '10' // Max departures displayed
            }
        },
```
# Screenshot
![screenshot](https://user-images.githubusercontent.com/56306041/94842874-32095580-041c-11eb-9e65-752763020420.png)


# Further information
For all config options check [here](https://github.com/skuethe/MMM-HH-LocalTransport/blob/master/MMM-HH-LocalTransport.js#L15-L31).
