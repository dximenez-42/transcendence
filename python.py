def print_all_hosts():
    # Base host domain
    BASE_HOST = "42madrid.com"
    
    # Loop through rows 1 to 17 and seats 1 to 6
    for cluster in range(1, 4):
        for row in range(1, 20):  # Rows from 1 to 17
            for seat in range(1, 7):  # Seats from 1 to 6
                # Format and print the host
                host = f"http://c{cluster}r{row}s{seat}:8080/api/auth/login"
                print(host)

# Call the function to print all hosts
print_all_hosts()




