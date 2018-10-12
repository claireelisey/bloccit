const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;

describe("routes : posts", () => {

    beforeEach((done) => {
        this.topic;
        this.post;

        sequelize.sync({force: true}).then((res) => {

// In beforeEach, we create a Topic object followed by a Post object and associate them.
            Topic.create({
                title: "Winter Games",
                description: "Post your Winter Games stories."
            })
            .then((topic) => {
                this.topic = topic;

                Post.create({
                    title: "Snowball Fighting",
                    body: "So much snow!",
                    topicId: this.topic.id
                })
                .then((post) => {
                    this.post = post;
                    
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    
                    done();
                });
            });
        });

    });

    describe("GET /topics/:topicId/posts/new", () => {

        it("should render a new post form", (done) => {
            request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("New Post");
                
                done();
            });
        });
    
    });

    describe("POST /topics/:topicId/posts/create", () => {

        it("should create a new post and redirect", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/posts/create`,
                form: {
                    title: "Watching snow fall",
                    body: "It's the best time of the year!"
                }
            };
            request.post(options, (err, res, body) => {

                Post.findOne({where: {title: "Watching snow fall"}})
                .then((post) => {
                    expect(post).not.toBeNull();
                    expect(post.title).toBe("Watching snow fall");
                    expect(post.body).toBe("It's the best time of the year!");
                    expect(post.topicId).not.toBeNull();
                    
                    done();
                })
                .catch((err) => {
                    console.log(err);
                
                    done();
                });
            });
        });

        it("should not create a new post that fails validations", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/posts/create`,
                form: {
     
     // pass in values that should not pass validations
                    title: "a",
                    body: "b"
                }
            };
     
            request.post(options, (err, res, body) => {
     
     // look for a post matching the title passed in with the request and confirm that one doesn't exist
                Post.findOne({where: {title: "a"}})
                .then((post) => {
                    expect(post).toBeNull();
                    
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    
                    done();
                });
              }
            );
        });
     
    });

    describe("GET /topics/:topicId/posts/:id", () => {

        it("should render a view with the selected post", (done) => {
            request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Snowball Fighting");
                
                done();
            });
        });
   
    });

    describe("POST /topics/:topicId/posts/:id/destroy", () => {

        it("should delete the post with the associated ID", (done) => {
            expect(this.post.id).toBe(1);
            request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

                Post.findById(1)
                .then((post) => {
                    expect(err).toBeNull();
                    expect(post).toBeNull();
                    
                    done();
                })
    
            });

        });
   
    });

    describe("GET /topics/:topicId/posts/:id/edit", () => {

        it("should render a view with an edit post form", (done) => {
            request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Edit Post");
                expect(body).toContain("Snowball Fighting");
                
                done();
            });
        });
   
    });

    describe("POST /topics/:topicId/posts/:id/update", () => {

        it("should return a status code 302", (done) => {
            request.post({
                url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                form: {
                    title: "Snowman Building Competition",
                    body: "Who can build the largest of them all?"
                }
            }, 
            (err, res, body) => {
                expect(res.statusCode).toBe(302);
                
                done();
            });
        });
   
        it("should update the post with the given values", (done) => {
            const options = {
                url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                form: {
                    title: "Snowman Building Competition"
                }
            };
            request.post(options, (err, res, body) => {

                expect(err).toBeNull();

                Post.findOne({
                    where: {id: this.post.id}
                })
                .then((post) => {
                    expect(post.title).toBe("Snowball Fighting");
                    
                    done();
                });
            });
        });
   
    });
    

});