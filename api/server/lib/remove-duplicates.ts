import { Books } from "../collections/books";

export default function removeDuplicates() {

  var duplicates = [];

  Books.rawCollection().aggregate([
    {
      $match: {
        id: { "$ne": '' }  // discard selection criteria
      }
    },
    {
      $group: {
        _id: { id: "$id" }, // can be grouped on multiple properties
        dups: { "$addToSet": "$_id" },
        count: { "$sum": 1 }
      }
    },
    {
      $match: {
        count: { "$gt": 1 }    // Duplicates considered as count greater than one
      }
    }
  ],
    { allowDiskUse: true }       // For faster processing if set is larger
  )               // You can display result until this and check duplicates
    .forEach(function (doc) {
      doc.dups.shift();      // First element skipped for deleting
      doc.dups.forEach(function (dupId) {
        duplicates.push(dupId);   // Getting all duplicate ids
      }
      )
    })

  console.log(duplicates);
  // Remove all duplicates in one go
  Books.remove({ _id: { $in: duplicates } })

}
