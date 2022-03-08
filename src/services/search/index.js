import express from "express"
import CategoryModel from "../category/schema.js";
import BusinessModel from "../business/schema.js";
import ProductModel from "../Products/schema.js"
import createError from "http-errors";
import mongoose from "mongoose";

const searchRouter = express.Router()

searchRouter.post("/search", async (req, res, next) => {
    try {
  
      const searchInput  = req.query.searchQuery
  
      console.log(searchInput)
  
      const searchQ = searchInput.replace(/_/g, ' ')
  
      console.log(searchQ)



        const categoryAggregate = await CategoryModel.aggregate([
            {
              $search: {
                "autocomplete": {
                  "query": `${searchQ}`,
                  "path": "name",
                  "fuzzy": {
                    "maxEdits": 1
                  }
                }
              }
            },
            {
              $limit: 10
            },
            {
              $project: {
                "_id": 1,
                "name": 1,
                // "plot": 1
              }
            }
            ]);


           

            const businessAggregate = await BusinessModel.aggregate([
              {
                $search: {
                  compound: {
                    should: [
                 { "autocomplete": {
                    "query": `${searchQ}`,
                    "path": "businessName",
                    "fuzzy": {
                      "maxEdits": 1
                    }
                  }
                },
                { "autocomplete": {
                  "query": `${searchQ}`,
                  "path": "website",
                  "fuzzy": {
                    "maxEdits": 1
                  }
                }
              },
              { "text": {
                "query": `${searchQ}`,
                "path": "categoryID",
                "fuzzy": {
                  "maxEdits": 1
                }
              }
            },
              ]
              }
              }
            },
              {
                $limit: 10
              },
              {
                $project: {
                  "_id": 1,
                  "businessName": 1,
                  "website": 1
                }
              }
            
              ]);
          
      

              const categoryBusiness = []
              

              for (let j = 0; j < categoryAggregate.length; j++) {
                const output = await BusinessModel.find({ categoryID: mongoose.Types.ObjectId(categoryAggregate[j]._id) })
                if (output.length > 0) {
                  categoryBusiness.push(output[0])
                } 
              }

              // const results = await Promise.all(categoryBusiness)

              console.log(categoryBusiness, "here")
  

  
        console.log(businessAggregate, categoryAggregate,
            // businessSearchResult, 
            "made it here")
  
      if (categoryAggregate || businessAggregate 
        // && productSearchResult
        ) {
        res.send({
            Categories: categoryAggregate,
            Businesses: [...businessAggregate,
            ...categoryBusiness]
        })
      } else {
        next(createError(404, `Query: No results found for ${req.query.searchQuery}!`))
      }
    } catch (error) {
      next(createError(500, "An error occurred while getting blog"))
    }
  })

  export default searchRouter