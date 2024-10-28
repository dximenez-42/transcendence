import uuid

def generate_unique_id():
    return str(uuid.uuid4())

def is_room_tournament(room):
	return room.room_type == 'Tournament'