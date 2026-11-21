import useDebounce from '@/common_component/useDebounce';
import Models from '@/imports/models.import';
import { useSetState } from '@/utils/functions.utils';
import React, { useEffect, useState } from 'react';

const Test = () => {
  const [state, setState] = useSetState({

  })


  useEffect(() => {
    getData()

  }, []);

  const getData = async () => {
    try {
      const body = body_data()
      const res = await Models.contact.create(body)
      console.log("ressss", res)
    } catch (error) {
      console.log("error", error)

    }
  }

  const search = useDebounce(state.search, 500)

  const body_data = () => {
    let body = ""
    if (state.search) {
      body.search = search

    }
    return body



  }



  return (
    <div className="instagram-feed">
      <h1>hello</h1>


    </div>
  );
};

export default Test;