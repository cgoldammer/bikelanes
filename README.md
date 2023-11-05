# Overview

Understanding bike lanes in NYC by looking at pictures of them.

# Todo

## Create map

- Filters: Year, matching coded (aka it's up to date)
- Make UI prettier

## Analysis

- What share of lanes designated "protected" (if matched) is physically protected?
- Show some examples of sharrows to highlight why they are bad
- Calculation: What's likelihood of an obstruction?

# Technical notes

## Mapillary

The token sometimes seems to stop working. Usually it works to
just create a new one.

https://www.mapillary.com/dashboard/developers

## Uploading to S3

```
aws s3 cp webpage/content/images s3://bikelanepictures --recursive
```