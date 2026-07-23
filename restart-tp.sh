#!/bin/bash
# Restart Tax Partner Flask
cd /opt/taxpartner

# Kill ALL python3 processes related to this app
pkill -f "/opt/taxpartner/app.py" 2>/dev/null
pkill -f "python3 app.py" 2>/dev/null
sleep 2

# Start fresh
/usr/local/python3/bin/python3 /opt/taxpartner/app.py > /opt/taxpartner/app.log 2>&1 &
echo $!
