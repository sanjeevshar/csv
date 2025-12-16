import csv

# File paths
file1_path = 'file1.csv'
file2_path = 'file2.csv'
output_path = 'common_records.csv'

# Read first CSV file and store records by second field
file1_records = {}
with open(file1_path, 'r', newline='', encoding='utf-8') as f1:
    reader1 = csv.reader(f1)
    for row in reader1:
        if len(row) >= 2:  # Ensure row has at least 2 fields
            key = row[1]  # Second field (index 1)
            file1_records[key] = row

# Read second CSV file and find matching records
common_records = []
with open(file2_path, 'r', newline='', encoding='utf-8') as f2:
    reader2 = csv.reader(f2)
    for row in reader2:
        if len(row) >= 2:  # Ensure row has at least 2 fields
            key = row[1]  # Second field (index 1)
            if key in file1_records:
                # Combine both records in the same row
                combined_row = file1_records[key] + row
                common_records.append(combined_row)

# Write common records to output file
with open(output_path, 'w', newline='', encoding='utf-8') as output:
    writer = csv.writer(output)
    writer.writerows(common_records)

print(f"Found {len(common_records)} common records")
print(f"Results written to {output_path}")