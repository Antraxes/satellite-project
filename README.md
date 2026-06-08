# Crowded Skies -  Visualisation of Earth Satellites
### Background/Introduction

A threejs project that simulates the orbit of all non-decayed satellites around Earth that are at least 10cm in diameter. 


### Research
- Data is stored in a JSON file, and was acquired from the space-track.org API. <br>

API stands for Application Programming Interface. They are "mechanisms that enable two software components to communicate with each other using a set of definitions and protocols." (Amazon Web Services, 2025) It is through this interface provided by space-track.org that I was able to request a JSON containing data on all satellites that do not have a decay date; a decay date signifies that a satellite is no longer orbiting. JSON stands for JavaScript Object Notation. It's a way to format data, making it easier for humans to read and access. It's core structure is almost always based on key: value pairs. (Robbins, 2022)

This is the request I made to the API: https://www.space-track.org/basicspacedata/query/class/gp/decay_date/null-val/epoch/%3Enow-10/format/json 
This is the structure of one of the satellite objects stored in the JSON:
```json
{
    "CCSDS_OMM_VERS": "3.0",
    "COMMENT": "GENERATED VIA SPACE-TRACK.ORG API",
    "CREATION_DATE": "2026-06-06T17:50:36",
    "ORIGINATOR": "18 SPCS",
    "OBJECT_NAME": "VANGUARD 1",
    "OBJECT_ID": "1958-002B",
    "CENTER_NAME": "EARTH",
    "REF_FRAME": "TEME",
    "TIME_SYSTEM": "UTC",
    "MEAN_ELEMENT_THEORY": "SGP4",
    "EPOCH": "2026-06-06T06:02:55.726368",
    "MEAN_MOTION": "10.85993221",
    "ECCENTRICITY": "0.18354653",
    "INCLINATION": "34.2474",
    "RA_OF_ASC_NODE": "348.0744",
    "ARG_OF_PERICENTER": "89.1892",
    "MEAN_ANOMALY": "291.7390",
    "EPHEMERIS_TYPE": "0",
    "CLASSIFICATION_TYPE": "U",
    "NORAD_CAT_ID": "5",
    "ELEMENT_SET_NO": "999",
    "REV_AT_EPOCH": "44209",
    "BSTAR": "0.00048480245000",
    "MEAN_MOTION_DOT": "0.00000355",
    "MEAN_MOTION_DDOT": "0.0000000000000",
    "SEMIMAJOR_AXIS": "8613.581",
    "PERIOD": "132.598",
    "APOAPSIS": "3816.439",
    "PERIAPSIS": "654.453",
    "OBJECT_TYPE": "PAYLOAD",
    "RCS_SIZE": "MEDIUM",
    "COUNTRY_CODE": "US",
    "LAUNCH_DATE": "1958-03-17",
    "SITE": "AFETR",
    "DECAY_DATE": null,
    "FILE": "5233480",
    "GP_ID": "327573891",
    "TLE_LINE0": "0 VANGUARD 1",
    "TLE_LINE1": "1 00005U 58002B   26157.25203387  .00000355  00000-0  48480-3 0  9991",
    "TLE_LINE2": "2 00005  34.2474 348.0744 1835465  89.1892 291.7390 10.85993221442090"
  },
```
The relevant pieces of data in this JSON for the simulation are TLE_LINE1 and TLE_LINE2, which are used in an algorithm called SGP4 to provide orbital data for a satellite at a given epoch. The satellites are coloured using the HSL colour system. The hue changes based on the age of the satellite in milliseconds. The range starts at a value of 120 for satellies aged 0 milliseconds, and decreases to 0 as the satellies get older up to the eldest. LAUNCH_DATE is used to calculate the age of satellites, which is then mapped to the hue range.

### Audience and Intentions
My intended target audience for this project is space enthusiasts, students, and potentially policy makers/politicians.

I wanted to convey the sheer magnitude of space debris around our planet and how most of this occured during more recent years. My intention is for people to see this simulation and be driven to start asking questions about what the implications of an ever growing number of satellites are. There are no international laws with the aim of cleaning up space debris (NASA, 2023) and so satellites needed for communication, research, and more could end up damaged or useless if collisions occur. Collisions themselves are the largest contributor to space debris and could end up causing "Kessler Syndome", which is where "each collision between objects generates more space debris, which increases the likelihood of further collisions". (Murtaza et al., 2020)

### Project Process & Design
Process and Design documentation can be found [here](README_DEVELOPMENT.md)

### Final Visualisation 
Simulation can be accessed [here](https://antraxes.github.io/satellite-project/)

### References and Links
Amazon Web Services (2025). What is an API? - API Beginner’s Guide - AWS. [online] Amazon Web Services, Inc. Available at: https://aws.amazon.com/what-is/api/ [Accessed 4 Jun. 2026].

Robbins, S. (2022). A beginner’s guide to JSON, the data format for the internet. [online] Stack Overflow Blog. Available at: https://stackoverflow.blog/2022/06/02/a-beginners-guide-to-json-the-data-format-for-the-internet/ [Accessed 4 Jun. 2026].

NASA (2023). Space Debris. [online] NASA. Available at: https://www.nasa.gov/headquarters/library/find/bibliographies/space-debris/ [Accessed 4 Jun. 2026].

Murtaza, A., Pirzada, S.J.H., Xu, T. and Jianwei, L. (2020). Orbital Debris Threat for Space Sustainability and Way Forward (Review Article). IEEE Access, [online] 8, pp.61000–61019. doi:https://doi.org/10.1109/access.2020.2979505.
‌