#!/bin/bash
# Install systemd services for Botwave Empire
# Run with sudo: sudo ./install-services.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_DIR="/etc/systemd/system"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== BOTWAVE SYSTEMD SERVICE INSTALLER ==="
echo ""

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Copy services
echo "Installing services..."
cp "$SCRIPT_DIR/razor-master.service" "$SERVICE_DIR/"
cp "$SCRIPT_DIR/botwave-hub.service" "$SERVICE_DIR/"

# Set permissions
chmod 644 "$SERVICE_DIR/razor-master.service"
chmod 644 "$SERVICE_DIR/botwave-hub.service"

# Reload systemd
echo "Reloading systemd..."
systemctl daemon-reload

# Enable services (start on boot)
echo "Enabling services..."
systemctl enable razor-master.service
systemctl enable botwave-hub.service

echo ""
echo -e "${GREEN}✓ Services installed and enabled${NC}"
echo ""
echo "Commands:"
echo "  sudo systemctl start razor-master    # Start Razor"
echo "  sudo systemctl start botwave-hub     # Start Botwave"
echo "  sudo systemctl status razor-master   # Check Razor status"
echo "  sudo systemctl status botwave-hub    # Check Hub status"
echo "  sudo journalctl -u razor-master -f   # View Razor logs"
echo ""
echo "Start now? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    systemctl start razor-master
    systemctl start botwave-hub
    echo -e "${GREEN}✓ Services started${NC}"
fi
