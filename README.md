# Ayuda API

Ayuda requires a POST request to be sent in order to retreive the play logs for a specific day.
This poses a challenge for realtime collection of data asthe Ayuda team discourages from continuously polling data in subintervals of time from their servers.

## Setup

```
git clone https://github.com/matrix-io/matrix-ayuda.git
cd matrix-ayuda
npm install
```

### PoP Parameters
Each PoP response received from Ayuda's server's returns an array of objects in the body. Below is a table documenting the key and value types of each parameter. The keys are only visible when the verbose mode is enabled.

|        key        |   value type   |                                                             desc                                                            | example                                       |
|:-----------------:|:--------------:|:---------------------------------------------------------------------------------------------------------------------------:|-----------------------------------------------|
| `DigitalFaceCode` |     string     |                           The ID of the Face (generally, this is the player that is playing)                                | `"CN-M"`                                      |
|     `SiteCode`    |     string     |                                               The ID of the location the Face is at                                         | `"CS001"`                                     |
|  `MediaFileName`  |     string     |                                             File name of the creative being played                                          | `"yoga.jpg"`                                  |
|  `AdvertiserName` |     string     |                                                   Full name for advertiser                                                  | `"Company"`                                   |
|  `AdvertiserCode` |     string     |                                                       Advertiser Code                                                       | `"CN"`                                        |
|    `SpotLength`   |     number     |                                    The length of the spot in the loop that the creative is in                               | `5`                                           |
|    `PlayToEnd`    |     boolean    |                         Was the creative set to play to its conclusion (if longer than the spot length)                     | `false`                                       |
|  `DesignDuration` |     number     |                 The native play time of the of the creative (could be longer or shorter than the spot length)               | `0`                                           |
|      `Times`      | array<objects> |          Array containing objects with a single key `"Datetime"`, holds a ISO 8601 string with the local player time        | `[{"DateTime" : "2017-08-04T00:00:23"}, ...]` |
