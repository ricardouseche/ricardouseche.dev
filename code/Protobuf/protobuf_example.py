import addressbook_pb2

person = addressbook_pb2.Person()
person.id = 1234
person.name = "Roger"
print(person)

print(person.HasField("id"))