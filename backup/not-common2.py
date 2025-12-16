import csv

# File paths
file1_path = 'verified-2024-921.csv' # smaller file
file2_path = 'naichana-22-02-85-raw.csv' # larger file
output_path = 'left_out_2022.csv'

# Read first CSV file and store records by second field
file1_records = {}
with open(file1_path, 'r', newline='', encoding='utf-8') as f1:
    reader1 = csv.reader(f1)
    for row in reader1:
        if len(row) >= 2:  # Ensure row has at least 2 fields
            key = row[1]  # Second field (index 1)
            file1_records[key] = row

# Read second CSV file and find matching records
left_out_records = []
with open(file2_path, 'r', newline='', encoding='utf-8') as f2:
    reader2 = csv.reader(f2)
    for row in reader2:
        key = row[1]  # Second field (index 1)
        if key not in file1_records:
            left_out_records.append(row)

# Write left out records to output file
with open(output_path, 'w', newline='', encoding='utf-8') as output:
    writer = csv.writer(output)
    writer.writerows(left_out_records)

print(f"Found {len(left_out_records)} left out records")
print(f"Results written to {output_path}")
