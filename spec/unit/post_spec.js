const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("Post", () => {

    beforeEach((done) => {
// Declare two variables to represent our topic and post objects
        this.topic;
        this.post;
        sequelize.sync({force: true}).then((res) => {

// Create a topic
            Topic.create({
                title: "Expeditions to Alpha Centauri",
                description: "A compilation of reports from recent visits to the star system."
            })
            .then((topic) => {
                this.topic = topic;
    // Create a post
                Post.create({
                    title: "My first visit to Proxima Centauri b",
                    body: "I saw some rocks.",
    // Associate the topic and the post by setting topicID attribute on the post object
                    topicId: this.topic.id
                })
                .then((post) => {
                    this.post = post;
                    
                    done();
                });
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });

    });

    describe("#create()", () => {

        it("should create a post object with a title, body, and assigned topic", (done) => {
   // Create a post and associate it with the topic created in beforeEach
            Post.create({
                title: "Pros of Cryosleep during the long journey",
                body: "1. Not having to answer the 'are we there yet?' question.",
                topicId: this.topic.id
            })
            .then((post) => {
   
   // Check to make sure we save the post successfully
            expect(post.title).toBe("Pros of Cryosleep during the long journey");
            expect(post.body).toBe("1. Not having to answer the 'are we there yet?' question.");
            
            done();
            })
            .catch((err) => {
                console.log(err);
                
                done();
            });
        });

        it("should not create a post with missing title, body, or assigned topic", (done) => {
            Post.create({
                title: "Pros of Cryosleep during the long journey"
            })
            .then((post) => {
       
             // the code in this block will not be evaluated since the validation error
             // will skip it. Instead, we'll catch the error in the catch block below
             // and set the expectations there
       
                done();
       
            })
            .catch((err) => {
       
                expect(err.message).toContain("Post.body cannot be null");
                expect(err.message).toContain("Post.topicId cannot be null");
                
                done();
       
            })
        });
    
    });

    describe("#setTopic()", () => {

        it("should associate a topic and a post together", (done) => {
    
    // Create a new topic with a unique ID
            Topic.create({
                title: "Challenges of interstellar travel",
                description: "1. The Wi-Fi is terrible"
            })
            .then((newTopic) => {
    
    // Confirm the association of the topic and post objects created in the  beforeEach call
            expect(this.post.topicId).toBe(this.topic.id);
    // Call setTopic on post and associate it with the new topic, newTopic
            this.post.setTopic(newTopic)
            .then((post) => {
    // Confirm the new association
                expect(post.topicId).toBe(newTopic.id);
                
                done();
    
            });
            })
        });
    
    });

    describe("#getTopic()", () => {

        it("should return the associated topic", (done) => {
   
            this.post.getTopic()
            .then((associatedTopic) => {
                expect(associatedTopic.title).toBe("Expeditions to Alpha Centauri");
                
                done();
            });
   
        });
   
    });

});