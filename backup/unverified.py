import csv

# File paths
file1_path = 'file1.csv'
file2_path = 'file2.csv'
output_path = 'unverified_records2.csv'

# Read first CSV file and store records by second field
file1_records = {}
with open(file1_path, 'r', newline='', encoding='utf-8') as f1:
    reader1 = csv.reader(f1)
    for row in reader1:
        if len(row) >= 2:  # Ensure row has at least 2 fields
            key = row[1].strip()  # Second field (index 1), remove whitespace
            if key:  # Skip if second column is blank or only spaces
                file1_records[key] = row

# Read second CSV file and find matching records
unverified_records = []
with open(file2_path, 'r', newline='', encoding='utf-8') as f2:
    reader2 = csv.reader(f2)
    for row in reader2:
        if len(row) >= 2:  # Ensure row has at least 2 fields
            key = row[1].strip()  # Second field (index 1), remove whitespace
            if key and key not in file1_records:  # Skip if blank and check for match
                # Combine both records in the same row
                unverified_records.append(row)

# Write unverified records to output file
with open(output_path, 'w', newline='', encoding='utf-8') as output:
    writer = csv.writer(output)
    writer.writerows(unverified_records)

print(f"Found {len(unverified_records)} unverified records")
print(f"Results written to {output_path}")