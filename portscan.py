import socket
import concurrent.futures
import ipaddress

def check_ssh_port(ip, port=22, timeout=1):
    """Check if SSH port is open on a given IP."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((str(ip), port))
        sock.close()
        if result == 0:
            return str(ip), True
        else:
            return str(ip), False
    except Exception:
        return str(ip), False

def scan_ssh_range(start_ip, end_ip, port=22, max_workers=50):
    """Scan a range of IPs for open SSH ports."""
    
    start = ipaddress.IPv4Address(start_ip)
    end   = ipaddress.IPv4Address(end_ip)
    
    # Generate all IPs in range
    ip_range = [
        ipaddress.IPv4Address(ip)
        for ip in range(int(start), int(end) + 1)
    ]

    print(f"\n{'='*50}")
    print(f"  SSH Port Scanner (Port {port})")
    print(f"  Range: {start_ip} - {end_ip}")
    print(f"  Total IPs to scan: {len(ip_range)}")
    print(f"{'='*50}\n")

    open_hosts   = []
    closed_hosts = []

    # Scan concurrently for speed
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(check_ssh_port, ip, port): ip for ip in ip_range}

        for i, future in enumerate(concurrent.futures.as_completed(futures), 1):
            ip, is_open = future.result()
            status = "✅ OPEN  " if is_open else "❌ CLOSED"
            print(f"[{i:3}/{len(ip_range)}] {ip:<15} SSH Port {port}: {status}")

            if is_open:
                open_hosts.append(ip)
            else:
                closed_hosts.append(ip)

    # Summary
    print(f"\n{'='*50}")
    print(f"  SCAN COMPLETE - SUMMARY")
    print(f"{'='*50}")
    print(f"  Total Scanned : {len(ip_range)}")
    print(f"  SSH Open      : {len(open_hosts)}")
    print(f"  SSH Closed    : {len(closed_hosts)}")
    print(f"{'='*50}\n")

    if open_hosts:
        print("Hosts with SSH OPEN:")
        for host in open_hosts:
            print(f"  --> {host}:22")
    else:
        print("No hosts found with SSH port open.")

    return open_hosts

# ===========================
# Run the scanner
# ===========================
if __name__ == "__main__":
    open_hosts = scan_ssh_range(
        start_ip="10.7.8.1",
        end_ip="10.7.8.255",
        port=22,
        max_workers=50   # Increase for faster scan
    )

