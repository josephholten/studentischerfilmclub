import logging
from typing import Annotated

from ..dependencies import is_member
from ..models import *
from ..database_connection import db

from fastapi import APIRouter, HTTPException, Depends
from fastapi.encoders import jsonable_encoder

import pymongo

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.post("/post")
async def write_event(event_data: EventData, user: Annotated[User, Depends(is_member)]):
    logging.info(f"0 {event_data}")
    event = jsonable_encoder(event_data)
    logging.info(f"1 {event}")
    event["datetime"] = datetime.datetime.fromisoformat(event["date"] + "T" + event["time"])
    del event["date"]
    del event["time"]
    if not event["link"]:
        del event["link"]
    logging.info(f"2 {event}")
    
    # check if document is inserted
    if db.events.count_documents(event) != 0:
        logging.info(f"Event already present: {event}")
        return

    # inset document
    db_confirmation = db["events"].insert_one(event)

    # logging and error handling
    if db_confirmation.acknowledged:
        logging.info(f"Inserted event: {event}")
        return
    else:
        logging.error(f"NOT Inserted event: {event}")
        raise HTTPException(status_code=500, detail="Error inserting document.")

@router.get("/all", response_model=list[Event])
async def get_all_events() -> list[dict]:
    return list(
        db.events.find({})
        .sort("datetime", pymongo.ASCENDING)
    )

@router.get("/next", response_model=list[Event])
async def get_next_events() -> list[dict]:
    return list(
        db.events.find({})#"datetime": {"$gte": datetime.datetime.now()}})
        #.sort("datetime", pymongo.ASCENDING)
    )

