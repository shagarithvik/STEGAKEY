const fs = require('fs');
const path = require('path');

function sendNative(msg){
	const s = JSON.stringify(msg);
	const len = Buffer.byteLength(s);
	const header = Buffer.alloc(4);
	header.writeUInt32LE(len,0);
	process.stdout.write(header);
	process.stdout.write(s);
}

function scan() {
	// Scan drive letters D: through Z: for USB markers
	for (let drive = 'D'.charCodeAt(0); drive <= 'Z'.charCodeAt(0); drive++) {
		const driveLetter = String.fromCharCode(drive) + ':';
		const markerPath = path.join(driveLetter, '.stps_marker');
		
		try {
			if (fs.existsSync(markerPath)) {
				const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
				const carrier = path.join(driveLetter, marker.carrier_path);
				
				if (fs.existsSync(carrier)) {
					const buf = fs.readFileSync(carrier);
					const b64 = buf.toString('base64');
					sendNative({type:'carrier_data', carriers:[{data:b64}]});
					return;
				}
			}
		} catch (err) {
			// Drive might not be mounted or accessible
		}
	}
	
	// Signal no USB found
	sendNative({type:'usb_removed'});
}

// Scan immediately on startup
scan();
// Then scan every 2 seconds
setInterval(scan, 2000);

