import csv

# File paths
file1_path = 'naichana-22-02-85-above-80-final.csv'
#file2_path = 'file2.csv'
output_path = 'expired_voters.csv'
col = 8  # Column index to check for 'expired' pattern
pattern = 'expired'

# Read second CSV file and find matching records
expired_records = []
with open(file1_path, 'r', newline='', encoding='utf-8') as f2:
    reader2 = csv.reader(f2)
    for row in reader2:
        val = row[col].lower()
        print(val)
        if pattern in val:
            expired_records.append(row)

# Write expired records to output file
with open(output_path, 'w', newline='', encoding='utf-8') as output:
    writer = csv.writer(output)
    writer.writerows(expired_records)

print(f"Found {len(expired_records)} expired records")
print(f"Results written to {output_path}")